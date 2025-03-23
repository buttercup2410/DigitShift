# DigitShift Challenge 🎮

A modern, interactive number sliding puzzle game built with Next.js and TypeScript. Challenge yourself to arrange numbers in the correct sequence while enjoying smooth animations and satisfying sound effects.

## Features ✨

- **Interactive Sliding Puzzle**: Click tiles to slide them into the correct sequence
- **Real-time Progress Tracking**: Monitor your moves and time
- **Undo/Redo Functionality**: Up to 5 moves can be undone/redone
- **Victory Celebration**: Enjoy confetti animation and sound effects upon completion
- **Modern UI**: Clean, responsive design with smooth animations
- **Sound Effects**: Interactive audio feedback for moves and victory
- **Accessibility**: Keyboard navigation support and clear visual feedback

## Tech Stack 🛠️

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom components with shadcn/ui
- **Animations**: react-confetti for victory celebration
- **State Management**: React useState and useEffect hooks
- **Build Tool**: Built-in Next.js compiler
- **Package Manager**: pnpm

## Installation and Setup 🚀

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/number-puzzle.git
   cd number-puzzle
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```

4. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## Folder Structure 📁

```
number-puzzle/
├── app/                    # Next.js app directory
│   ├── confetti.tsx       # Confetti animation component
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main game component
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
│   └── use-window-size.ts # Window size hook
├── public/               # Static assets
│   └── confetti.mp3     # Sound effects
├── styles/              # Additional styling
├── package.json         # Project dependencies
└── README.md           # Project documentation
```

## Game Rules 📋

1. The game presents a 3x3 grid with numbers 1-8 and one empty space
2. Click on tiles adjacent to the empty space to slide them
3. Arrange the numbers in ascending order with the empty space at the end
4. The target sequence is: 8, 0, 1, 3, 9, 5, 2, 1, [empty]
5. Track your progress with the moves counter and timer
6. Use undo/redo buttons to correct mistakes

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments 🙏

- Inspired by classic sliding puzzle games
- UI design inspired by modern web applications
- Sound effects from Mixkit 
