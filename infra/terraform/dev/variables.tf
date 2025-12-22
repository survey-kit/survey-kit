variable "aws_profile" {
  description = "AWS profile name for authentication"
  type        = string
  default     = "default"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-west-2"
}

variable "bucket_name" {
  description = "S3 bucket name for website hosting (must be globally unique)"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.bucket_name)) && length(var.bucket_name) >= 3 && length(var.bucket_name) <= 63
    error_message = "Bucket name must be 3-63 characters, lowercase letters, numbers, and hyphens only, and cannot start or end with hyphens."
  }
}

variable "domain_name" {
  description = "Domain name for CloudFront distribution (e.g., aws-template.survey-kit.com)"
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9.-]+$", var.domain_name))
    error_message = "Domain name must contain only letters, numbers, dots, and hyphens."
  }
}

variable "environment" {
  description = "Environment name (dev/prod)"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be either 'dev' or 'prod'."
  }
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for HTTPS (must be in us-east-1 for CloudFront)"
  type        = string
  validation {
    condition     = can(regex("^arn:aws:acm:", var.acm_certificate_arn))
    error_message = "Must be a valid ACM certificate ARN."
  }
}
