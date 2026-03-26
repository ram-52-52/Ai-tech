import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
}

export function SEO({ title, description, keywords }: SEOProps) {
  const fullTitle = `${title} | AI-Tech SaaS`;
  const defaultDesc = "Empower your content strategy with AI-Tech SaaS - The world's most advanced AI blogging platform.";
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
