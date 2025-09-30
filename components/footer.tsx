export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Comic Theorem • Built by Siddhant Bhuyar • SiddhantDCT</p>
          <div className="flex justify-center space-x-6">
            <a 
              href="https://github.com/SiddhantDCT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              About
            </a>
            <a 
              href="https://www.linkedin.com/in/siddhant-bhuyar-3890b52b7/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              Contact
            </a>
            <a 
              href="https://comicvine.gamespot.com/api/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              API
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}