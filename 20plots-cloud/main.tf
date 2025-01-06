variable "TWENTYPLOTS_POSTGRES_URL" {
  description = "The PostgreSQL JDBC URL"
}

variable "TWENTYPLOTS_POSTGRES_USERNAME" {
  description = "The PostgreSQL username"
}

variable "TWENTYPLOTS_POSTGRES_PASSWORD" {
  description = "The PostgreSQL password"
}

variable "TWENTYPLOTS_JWT_SECRET" {
  description = "The JWT Secret"
}

variable "TWENTYPLOTS_FRONTEND_URL" {
  description = "The Frontend URL"
}

variable "TWENTYPLOTS_OPENROUTER_APIKEY" {
  description = "The OpenRouter API Key"
}

variable "TWENTYPLOTS_OPENAI_APIKEY" {
  description = "The OpenAI API Key"
}

variable "TWENTYPLOTS_OPENAI_MODEL" {
  description = "The OpenAI Model"
}

variable "aws_account_id" {
  description = "AWS Account ID"
}

variable "aws_region" {
  description = "AWS Region"
  default     = "us-east-2"
}

variable "acm_certificate_arn" {
  description = "ACM Certificate ARN"
}

variable "twentyplots_secret_name_prefix" {
  description = "Prefix for Secrets Manager secret"
  default     = "twentyplots-sensitive-data"
}

provider "aws" {
  region = var.aws_region
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.0"

  name            = "twentyplots_vpc"
  cidr            = "10.0.0.0/16"
  azs             = ["us-east-2a", "us-east-2b"]
  private_subnets = ["10.0.1.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Environment = "prod"
  }
}

variable "server_docker_image_uri" {
  description = "Full Docker image URI for the server"
}

variable "ui_docker_image_uri" {
  description = "Full Docker image URI for the UI"
}

variable "current_github_sha" {
  default     = "0"
  description = "GitHub SHA for tagging images"
}

locals {
  current_github_sha = var.current_github_sha
  deploy_server      = (var.server_docker_image_uri != "" && endswith(var.server_docker_image_uri, local.current_github_sha)) ? true : false
  deploy_ui          = (var.ui_docker_image_uri != "" && endswith(var.ui_docker_image_uri, local.current_github_sha)) ? true : false
}

variable "server_container_port" {
  default = 8080
}

variable "ui_container_port" {
  default = 80
}

resource "aws_ecs_cluster" "cluster" {
  name = "twentyplots-cluster"
}

resource "aws_ecs_task_definition" "task_definition" {
  family                   = "twentyplots-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = <<DEFINITION
[
  {
    "name": "twentyplots-server",
    "image": "${var.server_docker_image_uri}",
    "essential": true,
    "portMappings": [
      {
        "containerPort": ${var.server_container_port},
        "protocol": "tcp"
      }
    ],
    "environment": [
      {"name": "TWENTYPLOTS_POSTGRES_URL", "value": "${var.TWENTYPLOTS_POSTGRES_URL}"},
      {"name": "TWENTYPLOTS_POSTGRES_USERNAME", "value": "${var.TWENTYPLOTS_POSTGRES_USERNAME}"},
      {"name": "TWENTYPLOTS_POSTGRES_PASSWORD", "value": "${var.TWENTYPLOTS_POSTGRES_PASSWORD}"},
      {"name": "TWENTYPLOTS_JWT_SECRET", "value": "${var.TWENTYPLOTS_JWT_SECRET}"},
      {"name": "TWENTYPLOTS_FRONTEND_URL", "value": "${var.TWENTYPLOTS_FRONTEND_URL}"},
      {"name": "TWENTYPLOTS_OPENROUTER_APIKEY", "value": "${var.TWENTYPLOTS_OPENROUTER_APIKEY}"},
      {"name": "TWENTYPLOTS_OPENAI_APIKEY", "value": "${var.TWENTYPLOTS_OPENAI_APIKEY}"},
      {"name": "TWENTYPLOTS_OPENAI_MODEL", "value": "${var.TWENTYPLOTS_OPENAI_MODEL}"}
    ],
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:${var.server_container_port}/api/health || exit 1"],
      "interval": 120,
      "timeout": 5,
      "retries": 3,
      "startPeriod": 0
    },
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/twentyplots-server",
        "awslogs-region": "${var.aws_region}",
        "awslogs-stream-prefix": "ecs"
      }
    }
  },
  {
    "name": "twentyplots-ui",
    "image": "${var.ui_docker_image_uri}",
    "essential": true,
    "portMappings": [
      {
        "containerPort": ${var.ui_container_port},
        "protocol": "tcp"
      }
    ],
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:${var.ui_container_port}/healthcheck.html || exit 1"],
      "interval": 120,
      "timeout": 5,
      "retries": 3,
      "startPeriod": 0
    },
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/twentyplots-ui",
        "awslogs-region": "${var.aws_region}",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }
]
DEFINITION
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs_task_execution_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# Allow reading from Secrets Manager
resource "aws_iam_policy" "secretsmanager_access" {
  name        = "secretsmanager_access"
  description = "Provides read access to Secrets Manager"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:${var.twentyplots_secret_name_prefix}-*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "attach_secretsmanager_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.secretsmanager_access.arn
}

# Allow writing logs to CloudWatch
resource "aws_iam_policy" "ecs_tasks_cloudwatch_logs" {
  name        = "ecs_tasks_cloudwatch_logs"
  description = "Provides write access to CloudWatch Logs"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "attach_cloudwatch_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_tasks_cloudwatch_logs.arn
}

# ALB security group
resource "aws_security_group" "public_alb_sg" {
  name        = "public_alb_sg"
  description = "Allow inbound traffic on ports 80 and 443 for ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ECS Tasks security group
resource "aws_security_group" "private_ecs_tasks_sg" {
  name        = "private_ecs_tasks_sg"
  description = "Allow inbound traffic from ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.public_alb_sg.id]
  }

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.public_alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ECS Service
resource "aws_ecs_service" "service" {
  name                = "twentyplots-service"
  cluster             = aws_ecs_cluster.cluster.id
  task_definition     = aws_ecs_task_definition.task_definition.arn
  desired_count       = 1
  launch_type         = "FARGATE"
  force_new_deployment = local.deploy_server || local.deploy_ui

  network_configuration {
    assign_public_ip = true
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.private_ecs_tasks_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.twentyplots-ui-target-group.arn
    container_name   = "twentyplots-ui"
    container_port   = var.ui_container_port
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.twentyplots-server-target-group.arn
    container_name   = "twentyplots-server"
    container_port   = var.server_container_port
  }

  depends_on = [
    aws_lb_listener.http,
    aws_lb_listener.https
  ]
}

# ALB
resource "aws_lb" "lb" {
  name               = "twentyplots-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.public_alb_sg.id]
  subnets            = module.vpc.public_subnets
  idle_timeout       = 600
}

resource "aws_lb_target_group" "twentyplots-server-target-group" {
  name          = "twentyplots-server-target-group"
  port          = var.server_container_port
  protocol      = "HTTP"
  vpc_id        = module.vpc.vpc_id
  target_type   = "ip"

  health_check {
    path                = "/api/health"
    interval            = 120
    timeout             = 3
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb_target_group" "twentyplots-ui-target-group" {
  name          = "twentyplots-ui-target-group"
  port          = var.ui_container_port
  protocol      = "HTTP"
  vpc_id        = module.vpc.vpc_id
  target_type   = "ip"

  health_check {
    path                = "/healthcheck.html"
    interval            = 120
    timeout             = 3
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.lb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "404 Not Found"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener_rule" "server_listener_rule" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.twentyplots-server-target-group.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_lb_listener_rule" "ui_listener_rule" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.twentyplots-ui-target-group.arn
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

resource "aws_security_group" "aurora_sg" {
  name        = "aurora_sg"
  description = "Allow inbound traffic from ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.private_ecs_tasks_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_secretsmanager_secret_version" "twentyplots_creds" {
  secret_id = "twentyplots-sensitive-data"
}

resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "twentyplots-db-subnet-group"
  subnet_ids = module.vpc.database_subnets
}

resource "aws_rds_cluster_instance" "aurora_instances" {
  for_each           = toset(["instance1"])
  identifier         = each.key
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = "aurora-postgresql"
  engine_version     = "15.3"
  publicly_accessible = true
  db_subnet_group_name = aws_db_subnet_group.db_subnet_group.name
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = "twentyplots-aurora"
  engine                  = "aurora-postgresql"
  engine_mode             = "provisioned"
  engine_version          = "15.3"
  storage_encrypted       = true
  database_name           = "twentyplotsdb"
  master_username         = var.TWENTYPLOTS_POSTGRES_USERNAME
  master_password         = var.TWENTYPLOTS_POSTGRES_PASSWORD
  db_subnet_group_name    = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids  = [aws_security_group.aurora_sg.id]
  apply_immediately       = true
  skip_final_snapshot     = true
  enable_http_endpoint    = true

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 2
  }
}

# ECR pull access
resource "aws_iam_policy" "ecr_access" {
  name        = "ecr_access"
  description = "Provides access to ECR"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:GetRepositoryPolicy",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:DescribeImages",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "attach_ecr_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecr_access.arn
}

resource "aws_cloudwatch_log_group" "twentyplots_server_log_group" {
  name              = "/ecs/twentyplots-server"
  retention_in_days = 3
}

resource "aws_cloudwatch_log_group" "twentyplots_ui_log_group" {
  name              = "/ecs/twentyplots-ui"
  retention_in_days = 3
}

resource "aws_cloudwatch_log_group" "twentyplots_aurora_postgres_log_group" {
  name              = "/aws/rds/cluster/twentyplots-aurora/postgresql"
  retention_in_days = 3
}
