import re, sys, pathlib

def is_sep(row):
    return all(re.fullmatch(r':?-{1,}:?', c.strip()) for c in row if c.strip() != '')

def cells(line):
    s = line.strip()
    if s.startswith('|'): s = s[1:]
    if s.endswith('|'): s = s[:-1]
    return [c.strip() for c in s.split('|')]

def align(block):
    rows = [cells(l) for l in block]
    n = max(len(r) for r in rows)
    rows = [r + [''] * (n - len(r)) for r in rows]
    sep_i = [i for i, r in enumerate(rows) if is_sep(r)]
    widths = [0] * n
    for i, r in enumerate(rows):
        if i in sep_i: continue
        for j, c in enumerate(r):
            widths[j] = max(widths[j], len(c))
    widths = [max(w, 3) for w in widths]
    out = []
    for i, r in enumerate(rows):
        if i in sep_i:
            out.append('| ' + ' | '.join('-' * widths[j] for j in range(n)) + ' |')
        else:
            out.append('| ' + ' | '.join(r[j].ljust(widths[j]) for j in range(n)) + ' |')
    return out

p = pathlib.Path(sys.argv[1])
lines = p.read_text().split('\n')
out, block, fence = [], [], False
for ln in lines:
    if ln.lstrip().startswith('```'): fence = not fence
    if not fence and ln.lstrip().startswith('|') and ln.rstrip().endswith('|'):
        block.append(ln)
        continue
    if block:
        out.extend(align(block) if len(block) >= 2 else block); block = []
    out.append(ln)
if block: out.extend(align(block) if len(block) >= 2 else block)
p.write_text('\n'.join(out))
print(f"aligned tables in {p}")
