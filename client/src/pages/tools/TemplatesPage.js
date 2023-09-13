import React from 'react'
import TemplatesContainer from '../../containers/tools/uploads/TemplateContainer';

const TemplatesPage = () => {
  return (
    <>
      <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-center p-3 pt-5 bg-white">
          <TemplatesContainer/>
      </main>
    </>
  )
}

export default TemplatesPage