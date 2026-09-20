import { getManagedBallBearingProducts } from "../../../managed-product-data";
import { productImageUrl } from "../../../bearing-product-images";

export default async function BallBearingCatalog() {
  const products = await getManagedBallBearingProducts();
  return <main className="catalog-page"><header className="nav"><a className="brand" href="/">Bearing <span>Mart BD</span></a><a className="nav-call" href="https://wa.me/8801914528336">WhatsApp Now</a></header><section className="catalog-hero"><p className="eyebrow">BALL BEARINGS CATALOGUE</p><h1>Find your bearing.</h1><p>Dimensions and commercial availability are confirmed on enquiry.</p></section><section className="catalog-grid">{products.map(product => <a href={`/products/ball-bearings/catalog/${product.slug}`} className="catalog-card" key={product.slug}><img className="catalog-card-image" src={productImageUrl(product.bearingNumber,product.imageKey)} alt={`${product.brand} ${product.bearingNumber} ${product.productType}`} loading="lazy"/><span>{product.brand} · {product.productType}</span><h2>{product.bearingNumber}</h2><p>{product.bore} × {product.outerDiameter} × {product.width} mm</p><strong>{product.stockStatus === "available_on_order" ? "Available on order →" : "Price on enquiry →"}</strong></a>)}</section></main>;
}
