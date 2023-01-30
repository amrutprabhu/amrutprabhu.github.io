import React, { useEffect } from 'react'

function AdsSection({ id, slot }) {
  useEffect(() => {
    if (!window.adsbygoogle) {
      return
    }

    window.adsbygoogle.push({})
  }, [])

  return (
    <>
      <div className={`adsbygoogle-${id}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-7490174059724719"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
          id={id}
        />
      </div>
    </>
  )
}

export default AdsSection
