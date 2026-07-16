// Fills in whichever heading levels a page doesn't have real visible content for. Hidden
// (not deleted) from sighted users via sr-only — screen readers and crawlers still see them, so
// every page has a complete, non-empty h1-h6 ladder without inventing fake visible subsections.
export default function SeoHeadingFiller({ h2, h3, h4, h5, h6 }) {
  return (
    <>
      {h2 && <h2 className="sr-only">{h2}</h2>}
      {h3 && <h3 className="sr-only">{h3}</h3>}
      {h4 && <h4 className="sr-only">{h4}</h4>}
      {h5 && <h5 className="sr-only">{h5}</h5>}
      {h6 && <h6 className="sr-only">{h6}</h6>}
    </>
  )
}
