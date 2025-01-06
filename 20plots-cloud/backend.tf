terraform {
  backend "s3" {
    bucket         = "twentyplots-terraform-state"
    key            = "20plots/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "20plots-terraform-locks"
    encrypt        = true
  }
}