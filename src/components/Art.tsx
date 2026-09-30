export function Motif({ kind = 'loops', className = '' }: { kind?: string; className?: string }) {
  return <svg className={`motif ${className}`} viewBox="0 0 200 180" fill="none" aria-hidden="true">
    {kind === 'loops' && <><path className="art-fill" d="M102 135C56 117 26 78 42 49C55 25 87 31 101 57C116 28 149 29 160 52C177 87 139 120 102 146"/><path d="M101 145C55 124 25 80 42 49C55 25 87 31 101 57C116 28 149 29 160 52C177 87 139 120 102 146Z"/><path d="M80 136C56 101 66 65 92 63C120 62 132 108 106 117C75 128 76 87 99 62"/><path d="M101 57C113 75 123 86 135 87"/></>}
    {kind === 'spark' && <><path className="art-fill" d="M72 24L88 66L134 53L107 91L132 133L87 118L59 151L61 106L20 88L64 76Z"/><path d="M78 30L91 68L134 58L109 92L134 129L91 118L63 152L64 107L26 89L65 78Z"/><path d="M158 23L162 40L178 46L162 53L155 71L151 52L135 46L153 40Z"/><path d="M149 115L155 133M143 126L162 120"/></>}
    {kind === 'window' && <><path className="art-fill" d="M50 142V75a50 50 0 0 1 100 0v67Z"/><path d="M50 145V76a50 50 0 0 1 100 0v69H50ZM100 26v119M51 88h98"/><path d="M52 87L26 61v87l26-4M150 87l24-26v87l-24-4M76 70l5-11M121 60l6 10"/><path d="M64 125c20-22 40-21 70 0"/></>}
    {kind === 'path' && <><path className="art-fill" d="M41 150C145 122 40 86 128 32L162 32C63 89 174 117 73 156Z"/><path d="M41 150C145 122 40 86 128 32M73 156C174 117 63 89 162 32"/><path d="M32 85V52M18 65l14-16 15 16M160 113v-31M146 95l14-17 14 17M82 44l5-6"/></>}
    {kind === 'home' && <><path className="art-fill" d="M39 89L101 35L160 89V145H39Z"/><path d="M26 94L101 29L173 94M42 82v65h116V82M85 147v-40h31v40M57 92h16v17H57"/><path d="M123 47V27h18v35M20 146h162M126 118c-13-10-4-23 4-14 8-9 17 4 4 14l-4 3Z"/></>}
    {kind === 'puzzle' && <><path className="art-fill" d="M28 56h51c-12-26 26-27 15 0h39v41c27-13 27 26 0 15v37H78v-38c-25 13-25-25 0-14V56"/><path d="M28 56h51c-12-26 26-27 15 0h39v41c27-13 27 26 0 15v37H78v-38c-25 13-25-25 0-14V56H28v93h50M147 30l6-13M160 42l14-6"/></>}
  </svg>
}

export function Mark() {
  return <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 32C4 23 2 13 9 9C15 5 20 11 22 17C24 24 17 26 15 21C12 15 23 4 30 9C40 16 27 28 20 32Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
