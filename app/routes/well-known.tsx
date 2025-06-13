// DevTools болон бусад тусгай хүсэлтүүдийг зохицуулах
export default function WellKnown() {
  // DevTools-ийн хүсэлтийг хоосон хариулт өгнө
  return null;
}

// HTTP статусыг 404 болгох
export function loader() {
  throw new Response(null, { status: 404 });
}