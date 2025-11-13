export const Layout = ({ 
  children, 
  header = null,  // Can be a component
  footer = null,  // Can be a component
}) => {
  return (
    <div className="flex flex-col h-screen">
      {(header !== null) && header}
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
      {(footer !== null) && footer}
    </div>
  )
}