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

