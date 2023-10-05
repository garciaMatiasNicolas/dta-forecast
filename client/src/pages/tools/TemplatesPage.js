import React from 'react'
import TemplatesContainer from '../../containers/tools/uploads/TemplateContainer';
import ToolsNav from '../../components/navs/ToolsNav';

const TemplatesPage = () => {
  return (
    <>
      <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
        <ToolsNav/>
        <TemplatesContainer/>
      </main>
    </>
  )
}

export default TemplatesPage