# DynamoDB Table for Survey Responses
resource "aws_dynamodb_table" "survey_responses" {
  name         = "${var.bucket_name}-responses"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  tags = {
    Name        = "${var.bucket_name}-responses"
    Environment = var.environment
    Project     = "survey-kit"
  }
}

# ECR Repository for Lambda Container Image
resource "aws_ecr_repository" "lambda" {
  name                 = "${var.bucket_name}-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
    Project     = "survey-kit"
  }
}

# ECR Lifecycle Policy - keep last 5 images
resource "aws_ecr_lifecycle_policy" "lambda" {
  repository = aws_ecr_repository.lambda.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = {
        type = "expire"
      }
    }]
  })
}

# Lambda Function (Container Image)
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_role" {
  name               = "${var.bucket_name}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = {
    Environment = var.environment
    Project     = "survey-kit"
  }
}

# Lambda basic execution policy (CloudWatch Logs)
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB access policy
data "aws_iam_policy_document" "dynamodb_access" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:Query",
    ]
    resources = [
      aws_dynamodb_table.survey_responses.arn
    ]
  }
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name   = "${var.bucket_name}-lambda-dynamodb"
  role   = aws_iam_role.lambda_role.id
  policy = data.aws_iam_policy_document.dynamodb_access.json
}

# Lambda function using container image
resource "aws_lambda_function" "api" {
  function_name = "${var.bucket_name}-api"
  role          = aws_iam_role.lambda_role.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.lambda.repository_url}:latest"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.survey_responses.name
      ALLOWED_ORIGINS     = "https://${var.domain_name}"
    }
  }

  tags = {
    Environment = var.environment
    Project     = "survey-kit"
  }

  depends_on = [aws_ecr_repository.lambda]
}

