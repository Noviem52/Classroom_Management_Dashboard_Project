import uuid
import boto3
from botocore.client import Config

from app.core.config import settings

s3_client = boto3.client(
    "s3",
    endpoint_url=settings.S3_ENDPOINT,
    aws_access_key_id=settings.S3_ACCESS_KEY,
    aws_secret_access_key=settings.S3_SECRET_KEY,
    config=Config(signature_version="s3v4"),
    region_name="us-east-1",
)

ALLOWED_CONTENT_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def generate_presigned_upload(filename: str, content_type: str) -> dict:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError("Unsupported content type")

    extension = ALLOWED_CONTENT_TYPES[content_type]
    object_key = f"banners/{uuid.uuid4()}.{extension}"

    upload_url = s3_client.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": object_key, "ContentType": content_type},
        ExpiresIn=300,
    )

    public_url = f"{settings.S3_PUBLIC_URL}/{settings.S3_BUCKET}/{object_key}"
    return {"upload_url": upload_url, "object_key": object_key, "public_url": public_url}