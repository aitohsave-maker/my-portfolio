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
        elif self.mode == 'chaos':
            # Custom settings will be handled in main() or default
            pass
        else:
            self.size = 16
            
        self.grid = [[0 for _ in range(self.size)] for _ in range(self.size)]
        self.hints = [[0 for _ in range(self.size)] for _ in range(self.size)]
        self.revealed = [[False for _ in range(self.size)] for _ in range(self.size)]
        self.flags = [[False for _ in range(self.size)] for _ in range(self.size)]
        self.chaos_nodes = []
        
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
        elif self.mode == 'chaos':
            self.generate_chaos_layout()
            self.calculate_chaos_hints()
            self.reveal_chaos_safe_nodes()
        else:
            self.player_pos = [0, 0]
            self.generate_classic_mines()
            self.calculate_hints()
            self.reveal_edges()

    def generate_chaos_layout(self):
        count = self.chaos_cell_count
        mines = self.chaos_mine_count
        
        # 1. Growth system: discrete grid coordinates
        nodes_map = {} # (x,y) -> index
        coords = [(0, 0)]
        nodes_map[(0, 0)] = 0

        while len(coords) < count:
            parent_x, parent_y = random.choice(coords)
            dx, dy = random.choice([(1, 0), (-1, 0), (0, 1), (0, -1)])
            nx, ny = parent_x + dx, parent_y + dy
            if (nx, ny) not in nodes_map:
                nodes_map[(nx, ny)] = len(coords)
                coords.append((nx, ny))
            
        # 2. Map indices to node objects and find neighbors
        self.chaos_nodes = []
        for x, y in coords:
            self.chaos_nodes.append({
                'gx': x, 'gy': y,
                'is_mine': False,
                'revealed': False,
                'flagged': False,
                'neighbors': [],
                'hint': 0
            })
            
        for i, node in enumerate(self.chaos_nodes):
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    if dx == 0 and dy == 0: continue
                    nx, ny = node['gx'] + dx, node['gy'] + dy
                    if (nx, ny) in nodes_map:
                        node['neighbors'].append(nodes_map[(nx, ny)])

        # 3. Mines (avoid degree <= 3)
        candidates = [i for i, n in enumerate(self.chaos_nodes) if len(n['neighbors']) > 3]
        random.shuffle(candidates)
    def calculate_chaos_hints(self):
        for node in self.chaos_nodes:
            if node['is_mine']: continue
            node['hint'] = sum(1 for neighbor_idx in node['neighbors'] 
                               if self.chaos_nodes[neighbor_idx]['is_mine'])

    def reveal_chaos_safe_nodes(self):
        for i, node in enumerate(self.chaos_nodes):
            if len(node['neighbors']) <= 3:
                self.reveal_chaos_cell(i)

    def reveal_chaos_cell(self, index):
        node = self.chaos_nodes[index]
        if node['revealed'] or node['flagged']: return
        node['revealed'] = True
        if node['hint'] == 0 and not node['is_mine']:
            for n_idx in node['neighbors']:
                self.reveal_chaos_cell(n_idx)
        self.check_chaos_win()

    def check_chaos_win(self):
        if self.is_game_over: return
        safe = [n for n in self.chaos_nodes if not n['is_mine']]
        if all(n['revealed'] for n in safe):
            self.is_game_over = True

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
        if random.random() < 0.5: self.grid[self.size-1][self.size-2] = 0
        else: self.grid[self.size-2][self.size-1] = 0
        for y in range(1, self.size - 1):
            for x in range(1, self.size - 1):
                if self.grid[y][x] == 1 and random.random() < 0.2: self.grid[y][x] = 0
        for dy in range(3):
            for dx in range(3):
                if dx < self.size and dy < self.size: self.grid[dy][dx] = 0

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
        if not (0 <= x < self.size and 0 <= y < self.size) or self.revealed[y][x]: return
        self.revealed[y][x] = True
        self.flags[y][x] = False
        if self.grid[y][x] == 0 and self.hints[y][x] == 0:
            for dy in [-1, 0, 1]:
                for dx in [-1, 0, 1]:
                    if dx != 0 or dy != 0: self.reveal_cell(x + dx, y + dy)
        if self.mode == 'classic': self.check_win()

    def check_win(self):
        if self.is_game_over: return
        safe = sum(1 for y in range(self.size) for x in range(self.size) if self.grid[y][x] == 0)
        revealed = sum(1 for y in range(self.size) for x in range(self.size) if self.grid[y][x] == 0 and self.revealed[y][x])
        if safe == revealed: self.is_game_over = True; return True
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
        if self.mode == 'chaos':
            is_flag = cmd.startswith('f')
            idx_str = cmd[1:] if is_flag else cmd
            try:
                idx = int(idx_str)
                node = self.chaos_nodes[idx]
                if is_flag:
                    if not node['revealed']: node['flagged'] = not node['flagged']
                else:
                    if node['flagged']: return False, "Node is flagged!"
                    if node['is_mine']:
                        self.is_game_over = True
                        for n in self.chaos_nodes: n['revealed'] = True
                        return True, "BOOM! Chaos consumed you."
                    self.reveal_chaos_cell(idx)
                return False, ""
            except: return False, "Chaos mode: enter Node ID (e.g. '5' or 'f5')"

        if self.mode == 'classic' or self.mode == 'labyrinth':
            if self.mode == 'classic':
                is_flag = cmd.startswith('f')
                coord_str = cmd[1:] if is_flag else cmd
                try:
                    x, y = map(int, coord_str.split(','))
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
        if self.mode == 'chaos':
            print("=== CHAOS MODE (IRREGULAR GRID) ===")
            print("Enter node ID to reveal, 'fID' to flag (e.g. '5' or 'f5')")
            
            # Print as a grid for better visualization
            min_x = min(n['gx'] for n in self.chaos_nodes)
            max_x = max(n['gx'] for n in self.chaos_nodes)
            min_y = min(n['gy'] for n in self.chaos_nodes)
            max_y = max(n['gy'] for n in self.chaos_nodes)
            
            # Map coord to ID for rendering
            pos_to_id = {(n['gx'], n['gy']): i for i, n in enumerate(self.chaos_nodes)}
            
            print("-" * 50)
            for gy in range(min_y, max_y + 1):
                row = []
                for gx in range(min_x, max_x + 1):
                    if (gx, gy) in pos_to_id:
                        idx = pos_to_id[(gx, gy)]
                        node = self.chaos_nodes[idx]
                        if node['flagged']: status = " F"
                        elif node['revealed']:
                            status = "💣" if node['is_mine'] else (f" {node['hint']}" if node['hint'] > 0 else " .")
                        else: status = f"{idx:2}"
                        row.append(f"[{status}]")
                    else:
                        row.append("    ")
                print("".join(row))
            return

        mode_title = "LABYRINTH MODE" if self.mode == 'labyrinth' else f"CLASSIC MINESWEEPER ({self.difficulty.upper()})"
        print(f"=== {mode_title} ===")
        if self.mode == 'labyrinth':
            print(f"HP: {'❤️'*self.hp} | Scans: {'📡'*self.scans}")
            print("Move: WASD | Flag: F+WASD | Radar: R | Goal: G")
        else:
            print(f"Mines: {self.mines_count} | Mode: Classic")
            print("Reveal: x,y | Flag: fx,y")
        print("-" * (self.size * 3 + 4))
        header = "   " + "".join(f"{i:2} " for i in range(self.size))
        print(header)
        for y in range(self.size):
            row = [f"{y:2}|"]
            for x in range(self.size):
                if self.mode == 'labyrinth' and [x, y] == self.player_pos: row.append(f"[{self.hints[y][x]}]")
                elif self.flags[y][x]: row.append(" F ")
                elif self.mode == 'labyrinth' and (x, y) == self.goal_pos: row.append(" G " if self.revealed[y][x] else " ?G")
                elif not self.revealed[y][x]: row.append(" ? ")
                elif self.grid[y][x] == 1: row.append(" # " if self.mode == 'labyrinth' else " 💣")
                else: row.append(" . " if self.hints[y][x] == 0 else f" {self.hints[y][x]} ")
            print("".join(row))

def main():
    game = BlindLabyrinth()
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print("=== BLIND LABYRINTH / MINESWEEPER ===")
        print("1. Labyrinth Mode")
        print("2. Classic Minesweeper Mode")
        print("3. Chaos Mode (Random Layout)")
        choice = input("Select Mode (1-3): ")
        if choice == '1':
            game.mode = 'labyrinth'
            break
        elif choice == '2':
            game.mode = 'classic'
            print("\nSelect Difficulty:\n1. Easy\n2. Medium\n3. Hard")
            diff = input("Choice (1-3): ")
            game.difficulty = {'1':'easy', '2':'medium', '3':'hard'}.get(diff, 'medium')
            break
        elif choice == '3':
            game.mode = 'chaos'
            try:
                game.chaos_cell_count = int(input("Number of Cells (e.g. 30): "))
                game.chaos_mine_count = int(input("Number of Mines (e.g. 5): "))
            except:
                game.chaos_cell_count, game.chaos_mine_count = 30, 5
            break
    
    game.setup_game()
    while True:
        game.render()
        if game.is_game_over:
            print("\nGame Over! Press Enter to exit.")
            input(); break
        cmd = input("Input: ")
        is_over, msg = game.move_player(cmd)
        if msg: print(msg)
        if is_over:
            game.is_game_over = True
            game.render()
            print(f"\n{msg}! Press Enter to exit.")
            input(); break

if __name__ == "__main__":
    main()
