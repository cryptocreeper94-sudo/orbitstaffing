import type { Express } from "express";

export function registerTrustLayerSSO(app: Express) {
  console.log("[TL SSO] orbitstaffing: SSO consumer endpoints registered");
  
  app.get("/api/tl/sso/login", (_req, res) => {
    const tlDomain = process.env.TRUST_LAYER_DOMAIN || "https://trustlayer.tlid.io";
    const callbackUrl = `${process.env.APP_DOMAIN ? 'https://' + process.env.APP_DOMAIN : 'http://localhost:5000'}/api/tl/sso/callback`;
    res.redirect(`${tlDomain}/sso/authorize?app=orbitstaffing&redirect_uri=${encodeURIComponent(callbackUrl)}`);
  });

  app.get("/api/tl/sso/callback", (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Missing SSO token" });
    res.redirect(`/?tl_token=${token}`);
  });
}
