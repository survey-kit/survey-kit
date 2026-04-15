resource "aws_cognito_user_pool" "admin_pool" {
  name = "survey_kit_admins_${var.environment}"

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  username_attributes = ["email"]

  auto_verified_attributes = ["email"]

  tags = {
    Environment = var.environment
    Project     = "survey-kit"
  }
}

resource "aws_cognito_user_pool_client" "admin_client" {
  name = "survey_kit_admin_client_${var.environment}"

  user_pool_id = aws_cognito_user_pool.admin_pool.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]

  prevent_user_existence_errors = "ENABLED"
}

# Self-sign-up pool for survey respondents (gamification / badges)
resource "aws_cognito_user_pool" "respondent_pool" {
  name = "survey_kit_respondents_${var.environment}"

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  username_attributes = ["email"]

  auto_verified_attributes = ["email"]

  tags = {
    Environment = var.environment
    Project     = "survey-kit"
  }
}

resource "aws_cognito_user_pool_client" "respondent_client" {
  name = "survey_kit_respondent_client_${var.environment}"

  user_pool_id = aws_cognito_user_pool.respondent_pool.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  prevent_user_existence_errors = "ENABLED"
}
