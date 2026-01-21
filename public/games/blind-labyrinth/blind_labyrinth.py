import random
import os

class BlindLabyrinth:
    def __init__(self):
        self.mode = 'labyrinth'
        self.difficulty = 'medium'
        self.size = 16
        self.setup_game()

    def setup_game(self):
        if self.mode == 'classic':
            configs = {'easy': (10, 10), 'medium': (16, 40), 'hard': (20, 80)}
            self.size, self.mines_count = configs[self.difficulty]
        else:
            self.size = 16
            
        self.grid = [[0 for _ in range(self.size)] for _ in range(self.size)]
        self.hints = [[0 for _ in range(self.size)] for _ in range(self.size)]
        self.revealed = [[False for _ in range(self.size)] for _ in range(self.size)]
        self.flags = [[False for _ in range(self.size)] for _ in range(self.size)]
        
        self.hp = 3
        self.scans = 3
        self.is_game_over = False

        if self.mode == 'labyrinth':
            self.grid = [[1 for _ in range(self.size)] for _ in range(self.size)]
            self.player_pos = [0, 0]
            self.start_pos = (0, 0)
            self.goal_pos = (self.size - 1, self.size - 1)
            self.generate_maze()
            self.calculate_hints()
            self.reveal_cell(0, 0)
        else:
            self.player_pos = [0, 0] # For cursor purpose in CLI
            self.generate_classic_mines()
            self.calculate_hints()
            self.reveal_edges()

    def generate_classic_mines(self):
        placed = 0
        while placed < self.mines_count:
            x, y = random.randint(0, self.size-1), random.randint(0, self.size-1)
            if x == 0 or y == 0 or x == self.size-1 or y == self.size-1: continue
            if self.grid[y][x] == 0:
                self.grid[y][x] = 1
                placed += 1

    def reveal_edges(self):
        for y in range(self.size):
            for x in range(self.size):
                if x == 0 or y == 0 or x == self.size-1 or y == self.size-1:
                    self.reveal_cell(x, y)

    def generate_maze(self):
        cx, cy = self.start_pos
        stack = [(cx, cy)]
        self.grid[cy][cx] = 0
        visited = {(cx, cy)}

        while stack:
            curr_x, curr_y = stack[-1]
            dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
            random.shuffle(dirs)
            
            found = False
            for dx, dy in dirs:
                nx, ny = curr_x + dx * 2, curr_y + dy * 2
                if 0 <= nx < self.size and 0 <= ny < self.size and (nx, ny) not in visited:
                    self.grid[curr_y + dy][curr_x + dx] = 0
                    self.grid[ny][nx] = 0
                    visited.add((nx, ny))
                    stack.append((nx, ny))
                    found = True
                    break
            if not found: stack.pop()

        self.grid[self.goal_pos[1]][self.goal_pos[0]] = 0
        if random.random() < 0.5:
            self.grid[self.size-1][self.size-2] = 0
        else:
            self.grid[self.size-2][self.size-1] = 0

        for y in range(1, self.size - 1):
            for x in range(1, self.size - 1):
                if self.grid[y][x] == 1 and random.random() < 0.2:
                    self.grid[y][x] = 0

        for dy in range(3):
            for dx in range(3):
                if dx < self.size and dy < self.size:
                    self.grid[dy][dx] = 0

    def calculate_hints(self):
        for y in range(self.size):
            for x in range(self.size):
                if self.grid[y][x] == 1: continue
                count = sum(1 for dy in [-1, 0, 1] for dx in [-1, 0, 1]
                           if 0 <= x+dx < self.size and 0 <= y+dy < self.size
                           and self.grid[y+dy][x+dx] == 1)
                self.hints[y][x] = count

    def toggle_flag(self, x, y):
        if 0 <= x < self.size and 0 <= y < self.size and not self.revealed[y][x]:
            self.flags[y][x] = not self.flags[y][x]

    def reveal_cell(self, x, y):
        if not (0 <= x < self.size and 0 <= y < self.size) or self.revealed[y][x]:
            return
        self.revealed[y][x] = True
        self.flags[y][x] = False
        if self.grid[y][x] == 0 and self.hints[y][x] == 0:
            for dy in [-1, 0, 1]:
                for dx in [-1, 0, 1]:
                    if dx != 0 or dy != 0:
                        self.reveal_cell(x + dx, y + dy)
        if self.mode == 'classic': self.check_win()

    def check_win(self):
        if self.is_game_over: return
        safe_cells = sum(1 for y in range(self.size) for x in range(self.size) if self.grid[y][x] == 0)
        revealed_safe = sum(1 for y in range(self.size) for x in range(self.size) if self.grid[y][x] == 0 and self.revealed[y][x])
        if safe_cells == revealed_safe:
            self.is_game_over = True
            return True
        return False

    def activate_scan(self):
        if self.scans <= 0: return False, "No scans left!"
        self.scans -= 1
        range_val = 2
        for dy in range(-range_val, range_val + 1):
            for dx in range(-range_val, range_val + 1):
                nx, ny = self.player_pos[0] + dx, self.player_pos[1] + dy
                if 0 <= nx < self.size and 0 <= ny < self.size:
                    self.revealed[ny][nx] = True
                    self.flags[ny][nx] = False
        return True, "Radar Scanned!"

    def move_player(self, cmd):
        cmd = cmd.lower()
        if self.mode == 'classic':
            is_flag = cmd.startswith('f')
            coord_str = cmd[1:] if is_flag else cmd
            try:
                if ',' in coord_str:
                    x, y = map(int, coord_str.split(','))
                else: return False, "Classic mode: enter 'x,y' to reveal or 'fx,y' to flag"
                if not (0 <= x < self.size and 0 <= y < self.size): return False, "Out of bounds!"
                if is_flag: self.toggle_flag(x, y)
                else:
                    if self.grid[y][x] == 1:
                        self.is_game_over = True
                        for i in range(self.size):
                            for j in range(self.size): self.revealed[i][j] = True
                        return True, "KABOOM! Game Over."
                    self.reveal_cell(x, y)
                return False, ""
            except: return False, "Input format: 'x,y' or 'fx,y'"

        if cmd == 'r': return self.activate_scan()
        if cmd.startswith('f'):
            target = cmd[1:]
            dx, dy = 0, 0
            if target == 'w': dy = -1
            elif target == 's': dy = 1
            elif target == 'a': dx = -1
            elif target == 'd': dx = 1
            if dx != 0 or dy != 0:
                self.toggle_flag(self.player_pos[0]+dx, self.player_pos[1]+dy)
                return False, ""
            return False, "Usage: f[wasd]"

        dx, dy = 0, 0
        if cmd == 'w': dy = -1
        elif cmd == 's': dy = 1
        elif cmd == 'a': dx = -1
        elif cmd == 'd': dx = 1
        else: return False, "WASD: Move, F+WASD: Flag, R: Radar"

        nx, ny = self.player_pos[0] + dx, self.player_pos[1] + dy
        if not (0 <= nx < self.size and 0 <= ny < self.size): return False, "Out of bounds!"
        if self.flags[ny][nx]: return False, "Flagged! Cannot move there."

        if self.grid[ny][nx] == 1:
            self.hp -= 1
            self.revealed[ny][nx] = True
            if self.hp <= 0:
                for y in range(self.size):
                    for x in range(self.size): self.revealed[y][x] = True
                return True, "GAME OVER - No HP left"
            return False, f"⚠️ WALL! HP: {self.hp}"

        self.player_pos = [nx, ny]
        self.reveal_cell(nx, ny)
        if (nx, ny) == self.goal_pos: return True, "VICTORY"
        return False, ""

    def render(self):
        os.system('cls' if os.name == 'nt' else 'clear')
        mode_title = "LABYRINTH MODE" if self.mode == 'labyrinth' else f"CLASSIC MINESWEEPER ({self.difficulty.upper()})"
        print(f"=== {mode_title} ===")
        
        if self.mode == 'labyrinth':
            print(f"HP: {'❤️'*self.hp} | Scans: {'📡'*self.scans}")
            print("Move: WASD | Flag: F+WASD | Radar: R | Goal: G")
        else:
            print(f"Mines: {self.mines_count} | Mode: Classic")
            print("Reveal: x,y | Flag: fx,y")
        
        print("-" * (self.size * 3 + 4))
        
        # Header for coordinates
        header = "   " + "".join(f"{i:2} " for i in range(self.size))
        print(header)

        for y in range(self.size):
            row = [f"{y:2}|"]
            for x in range(self.size):
                if self.mode == 'labyrinth' and [x, y] == self.player_pos:
                    row.append(f"[{self.hints[y][x]}]")
                elif self.flags[y][x]:
                    row.append(" F ")
                elif self.mode == 'labyrinth' and (x, y) == self.goal_pos:
                    row.append(" G " if self.revealed[y][x] else " ?G")
                elif not self.revealed[y][x]:
                    row.append(" ? ")
                elif self.grid[y][x] == 1:
                    row.append(" # " if self.mode == 'labyrinth' else " 💣")
                else:
                    if self.hints[y][x] == 0:
                        row.append(" . ")
                    else:
                        row.append(f" {self.hints[y][x]} ")
            print("".join(row))

def main():
    game = BlindLabyrinth()
    
    # Mode/Difficulty Selection Loop
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print("=== BLIND LABYRINTH / MINESWEEPER ===")
        print("1. Labyrinth Mode")
        print("2. Classic Minesweeper Mode")
        choice = input("Select Mode (1-2): ")
        if choice == '1':
            game.mode = 'labyrinth'
            break
        elif choice == '2':
            game.mode = 'classic'
            print("\nSelect Difficulty:")
            print("1. Easy (10x10)")
            print("2. Medium (16x16)")
            print("3. Hard (20x20)")
            diff = input("Choice (1-3): ")
            game.difficulty = {'1':'easy', '2':'medium', '3':'hard'}.get(diff, 'medium')
            break
    
    game.setup_game()
    
    while True:
        game.render()
        if game.is_game_over:
            print("\nGame Over! Press Enter to exit.")
            input()
            break
        
        # Check Win (for labyrinth we still use is_game_over but set it in move_player)
        
        cmd = input("Input: ")
        is_over, msg = game.move_player(cmd)
        
        if msg: print(msg)
        if is_over:
            game.is_game_over = True
            # Final render to show result
            game.render()
            print(f"\n{msg}! Press Enter to exit.")
            input()
            break

if __name__ == "__main__":
    main()
