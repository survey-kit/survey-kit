output "cloudfront_distribution_url" {
  description = "CloudFront distribution URL"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "cloudfront_distribution_domain_name" {
  description = "CloudFront distribution domain name (use this for Cloudflare CNAME record)"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for website hosting"
  value       = aws_s3_bucket.website.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.website.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.website.arn
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.website.arn
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "dynamodb_table_name" {
  description = "DynamoDB table name for survey responses"
  value       = aws_dynamodb_table.survey_responses.name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "ecr_repository_url" {
  description = "ECR repository URL for Lambda container image"
  value       = aws_ecr_repository.lambda.repository_url
}

output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool for Admins"
  value       = aws_cognito_user_pool.admin_pool.id
}

output "cognito_user_pool_client_id" {
  description = "ID of the Cognito User Pool Client for Admins"
  value       = aws_cognito_user_pool_client.admin_client.id
}

output "cognito_respondent_user_pool_id" {
  description = "ID of the Cognito User Pool for survey respondents"
  value       = aws_cognito_user_pool.respondent_pool.id
}

output "cognito_respondent_user_pool_client_id" {
  description = "ID of the Cognito User Pool Client for survey respondents (SPA)"
  value       = aws_cognito_user_pool_client.respondent_client.id
}
