import React from 'react';

export const Layout = React.forwardRef(({ 
  children, 
  header = null,
  footer = null,
}, ref) => {
  return (
    <div className="flex flex-col h-screen">
      {header}
      
      <main ref={ref} className="flex-1 overflow-y-auto">
        {children}
      </main>
      
      {footer}
    </div>
  );
});

Layout.displayName = 'Layout';