declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    SITES_TRUSTED_INGRESS?: string;
    ADMIN_EMAIL?: string;
    MIDTRANS_SERVER_KEY?: string;
    MIDTRANS_MODE?: string;
    LOCAL_ADMIN?: string;
  }
}
