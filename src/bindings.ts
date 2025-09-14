export type Bindings = {

    // BINDINGS DE SERVICIOS DE CLOUDFLARE: SE REGISTRAN EN EL ARCHIVO wrangler.jsonc y se crean en la UI de Cloudflare

    
    // VARIABLES: SE REGISTRAN EN EL ARCHIVO wrangler.jsonc
    EVOLUTION_API_URL: string
    EVOLUTION_INSTANCE_ID: string

    CLOUDFLARE_ACCOUNT_ID: string
    AWS_ACCESS_KEY: string

    // SECRETOS: SE DEBEN REGISTRAR MANUALMENTE EN LA UI DE CLOUDFLARE
    EVOLUTION_API_KEY: string

    CLOUDFLARE_API_TOKEN: string
    AWS_SECRET_KEY: string
}