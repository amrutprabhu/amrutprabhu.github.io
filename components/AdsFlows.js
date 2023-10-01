import React, { useEffect } from 'react'

function AdsFlows({ id, slot }) {
  useEffect(() => {
    if (!window.adsbygoogle) {
      return
    }

    window.adsbygoogle.push({})
  }, [])

  return (
    <>
      <div className={`adsbygoogle-${id}`}>
        {/* <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-7490174059724719"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
          id={id}
        /> */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-7490174059724719"
          data-ad-slot={slot}
          id={id}
        ></ins>
      </div>
    </>
  )
}

export default AdsFlows
