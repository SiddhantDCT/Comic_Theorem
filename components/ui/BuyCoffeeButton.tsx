export default function BuyCoffeeButton() {
  return (
    <a 
      href="https://buymeacoffee.com/SiddhantDCT" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors shadow-sm"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.5 2C5.5 2 4.6 2.5 4.1 3.3L2.3 6.2C1.5 7.5 2.4 9 4 9H20C21.6 9 22.5 7.5 21.7 6.2L19.9 3.3C19.4 2.5 18.5 2 17.5 2H6.5ZM4 10C2.3 10 1 11.3 1 13V18C1 20.2 2.8 22 5 22H19C21.2 22 23 20.2 23 18V13C23 11.3 21.7 10 20 10H4Z"/>
      </svg>
      Buy me a coffee
    </a>
  )
}