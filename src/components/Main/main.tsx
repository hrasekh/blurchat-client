import React from "react";

const Main = ({children}: 
    Readonly<{children: React.ReactNode}>) => (
    <main>
        {children}
    </main>
)

export default Main;