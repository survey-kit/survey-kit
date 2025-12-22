# Survey Kit Template - AWS S3 + CloudFront Deployment

This Terraform configuration deploys the Survey Kit template application to AWS S3 with CloudFront distribution, enabling fast and secure static website hosting.

## Directory Structure

```
infra/terraform/
├── dev/                          # Terraform configuration files
│   ├── main.tf                   # Core infrastructure resources
│   ├── variables.tf              # Input variable definitions
│   ├── outputs.tf                # Output definitions
│   └── README.md                 # This deployment guide
├── vars/dev/                     # Terraform state and variables (separate for cleanliness)
│   ├── terraform.tfstate         # Current terraform state
│   ├── terraform.tfstate.backup  # Previous state backup
│   ├── terraform.tfvars          # Variable values (contains sensitive data)
│   └── terraform.tfvars.example  # Example configuration template
```

**Why separate state files?** Terraform state files contain sensitive information and can become large. Keeping them separate from configuration files makes the repository cleaner and easier to manage.

## Architecture

```
Vite Build (dist/) → S3 Bucket → CloudFront Distribution → Cloudflare DNS (aws-template.survey-kit.com)
```

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) (v1.0+)
- [AWS CLI](https://aws.amazon.com/cli/) (v2.x)
- AWS account with appropriate permissions
- Domain managed by Cloudflare (survey-kit.com)

## AWS Profile Setup

1. Configure your AWS credentials:

```bash
aws configure --profile your-profile-name
```

2. Enter your AWS Access Key ID, Secret Access Key, default region (us-east-1), and output format (json).

## ACM Certificate Setup

CloudFront requires an SSL certificate from AWS Certificate Manager (ACM). The certificate must be in the `us-east-1` region.

1. Go to AWS Certificate Manager in the us-east-1 region
2. Request a public certificate
3. Add your domain: `aws-template.survey-kit.com`
4. Choose DNS validation
5. Add the CNAME record to your DNS (Cloudflare in this case)
6. Wait for validation to complete
7. Copy the certificate ARN for use in Terraform

## Quick Start (Recommended)

Use the deployment script for a streamlined experience:

```bash
# Configure variables first
cd infra/terraform/vars/dev
cp terraform.tfvars.example /terraform.tfvars
# Edit ../vars/dev/terraform.tfvars with your values
```

## Manual Deployment Steps

### 1. Build the Application

From the project root, build the Vite application:

```bash
cd packages/template
npm run build
```

This creates the `dist/` directory with built assets.

### 2. Configure Terraform Variables

Copy the example configuration file to the vars directory:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `../vars/dev/terraform.tfvars` with your values:

```hcl
aws_profile          = "your-aws-profile-name"
aws_region           = "us-east-1"
bucket_name          = "survey-kit-template-dev"
domain_name          = "aws-template.survey-kit.com"
environment          = "dev"
acm_certificate_arn  = "arn:aws:acm:us-east-1:YOUR_ACCOUNT_ID:certificate/YOUR_CERTIFICATE_ID"
```

### 3. Initialise Terraform

```bash
terraform init
```

### 4. Plan the Deployment

```bash
terraform plan -var-file=../vars/dev/terraform.tfvars
```

Review the plan to ensure it matches your expectations.

### 5. Apply the Infrastructure

```bash
terraform apply -var-file=../vars/dev/terraform.tfvars
```

Type `yes` when prompted. This will take 15-20 minutes for CloudFront distribution creation.

### 6. Upload Build Artifacts

After infrastructure is created, upload your build artifacts to S3:

```bash
aws s3 sync ../../../packages/template/dist/ s3://YOUR_BUCKET_NAME --profile your-profile-name
```

Replace `YOUR_BUCKET_NAME` with the bucket name from your `terraform.tfvars`.

### 7. Configure Cloudflare DNS

1. In your Cloudflare dashboard, go to DNS settings for `survey-kit.com`
2. Add a new CNAME record:
   - **Type**: CNAME
   - **Name**: `aws-template`
   - **Target**: The CloudFront domain name from Terraform output (e.g., `d123456789abc.cloudfront.net`)
   - **Proxy status**: DNS only (grey cloud)
   - **TTL**: Auto

3. Save the record

### 8. Verify Deployment

After DNS propagation (5-30 minutes), visit `https://aws-template.survey-kit.com` to verify the deployment.

## Terraform Outputs

After successful deployment, Terraform will output:

- `cloudfront_distribution_url`: The HTTPS URL of your website
- `cloudfront_distribution_domain_name`: Domain name for Cloudflare CNAME
- `s3_bucket_name`: S3 bucket name
- `cloudfront_distribution_id`: CloudFront distribution ID

## Updating the Application

To deploy updates:

1. Build the application: `npm run build` in `packages/template`
2. Sync to S3: `aws s3 sync ../../../packages/template/dist/ s3://YOUR_BUCKET_NAME --profile your-profile-name`
3. CloudFront will automatically serve the updated content (may take a few minutes to propagate)

## Cleanup

To destroy the infrastructure:

```bash
cd infra/terraform/dev
terraform destroy -var-file=terraform.tfvars
```

**Note**: This will delete all data in the S3 bucket. Make sure to backup any important data first.

## Troubleshooting

### CloudFront Distribution Stuck in "In Progress"

- Wait 15-20 minutes for distribution creation
- Check AWS CloudFront console for status

### 403 Forbidden Errors

- Ensure build artifacts are uploaded to the correct S3 bucket
- Check S3 bucket policy allows CloudFront access
- Verify CloudFront Origin Access Control is properly configured

### SSL Certificate Issues

- Ensure ACM certificate is in us-east-1 region
- Verify certificate validation is complete
- Check certificate ARN is correct in `terraform.tfvars`

### DNS Issues

- Allow 5-30 minutes for DNS propagation
- Verify CNAME record is correctly configured in Cloudflare
- Ensure Cloudflare proxy is disabled (grey cloud)

## Security Considerations

- S3 bucket is configured with public access blocked
- Access is restricted to CloudFront only via Origin Access Control
- All traffic is redirected to HTTPS
- Bucket versioning is enabled for backup/recovery

## Cost Optimisation

- CloudFront pricing is based on data transfer and requests
- S3 storage costs are minimal for static websites
- Consider enabling CloudFront compression for better performance and lower costs
