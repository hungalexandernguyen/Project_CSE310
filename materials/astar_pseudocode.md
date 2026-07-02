# A* Pathfinding Algorithm — Pseudocode

> **Context:** Used in the MyCampusApp campus navigation system to find the
> shortest walking route between two nodes on the campus road graph.
> The graph is built from `streets.json` (GeoJSON MultiLineString features),
> and edge weights are real-world distances in metres computed with the
> Haversine formula.

---

## Supporting Routines

```
function HAVERSINE(lat1, lng1, lat2, lng2) → real
    // Returns the great-circle distance in metres between two GPS coordinates.

function NODE_KEY(lat, lng) → string
    // Returns a canonical string key rounded to 5 decimal places (~1 m precision).
    return format("{lat:.5f},{lng:.5f}")

function SNAP_TO_GRAPH(graph, lat, lng) → nodeKey
    // Returns the key of the graph node nearest to the given GPS coordinate.
    bestKey  ← ""
    bestDist ← ∞
    for each (key, coord) in graph.nodes do
        d ← HAVERSINE(lat, lng, coord.lat, coord.lng)
        if d < bestDist then
            bestDist ← d
            bestKey  ← key
    return bestKey
```

---

## A* Algorithm

```
function ASTAR(graph, startKey, endKey) → path | null

    // ── Edge case ──────────────────────────────────────────────────
    if startKey = endKey then
        return [ graph.nodes[startKey] ]

    endCoord ← graph.nodes[endKey]
    if endCoord = null then
        return null

    // ── Initialisation ─────────────────────────────────────────────
    gScore ← empty map          // g(n): actual cost from start → n
    fScore ← empty map          // f(n) = g(n) + h(n)
    cameFrom ← empty map        // for path reconstruction

    gScore[startKey] ← 0

    startCoord ← graph.nodes[startKey]
    h0 ← HAVERSINE(startCoord.lat, startCoord.lng,
                    endCoord.lat,   endCoord.lng)
    fScore[startKey] ← h0

    openSet     ← min-priority-queue keyed on fScore
    openSetKeys ← empty set         // for fast membership test

    openSet.push( (fScore[startKey], startKey) )
    openSetKeys.add(startKey)

    // ── Main loop ──────────────────────────────────────────────────
    while openSet is not empty do

        // 1. Dequeue node with lowest f-score
        (_, current) ← openSet.pop_min()
        openSetKeys.remove(current)

        // 2. Goal check
        if current = endKey then
            return RECONSTRUCT_PATH(cameFrom, graph.nodes, current)

        // 3. Expand neighbours
        currentG ← gScore[current]   // always defined at this point

        for each edge (neighbourKey, weight, coord) in graph.adjacency[current] do

            tentativeG ← currentG + weight

            if tentativeG < gScore.get(neighbourKey, default=∞) then

                // Better path found — update records
                cameFrom[neighbourKey]  ← current
                gScore[neighbourKey]    ← tentativeG
                h ← HAVERSINE(coord.lat, coord.lng,
                               endCoord.lat, endCoord.lng)
                fScore[neighbourKey]    ← tentativeG + h

                // Add to open set if not already present
                if neighbourKey ∉ openSetKeys then
                    openSet.push( (fScore[neighbourKey], neighbourKey) )
                    openSetKeys.add(neighbourKey)

    // ── No path exists ─────────────────────────────────────────────
    return null
```

---

## Path Reconstruction

```
function RECONSTRUCT_PATH(cameFrom, nodes, current) → list of LatLng

    path ← empty list
    node ← current

    while node ≠ undefined do
        path.prepend( nodes[node] )   // add coordinate to front
        node ← cameFrom.get(node)     // follow parent pointers

    return path
```

---

## Complexity & Design Notes

| Aspect | Detail |
|---|---|
| **Heuristic h(n)** | Haversine distance to the goal — admissible & consistent on a geographic graph, so A* is optimal. |
| **Graph type** | Weighted undirected graph; edges are bidirectional street segments. |
| **Edge weight unit** | Metres (real-world walking distance). |
| **Priority queue** | Sorted array in the current implementation — adequate for small campus graphs. A binary heap would give O(log V) per operation for larger graphs. |
| **Time complexity** | O((V + E) log V) with a binary-heap open set, where V = nodes and E = edges. |
| **Space complexity** | O(V) for gScore, fScore, cameFrom, and openSet. |
| **Entry point** | Caller first snaps user GPS and destination GPS to graph nodes via `SNAP_TO_GRAPH`, then calls `ASTAR`. |

---

## Vietnamese Version (For Scientific Report / Báo cáo khoa học)

### 1. Mã giả chuẩn mực (Toán học / Tiếng Việt)

**Thuật toán 1:** Tìm đường đi ngắn nhất bằng thuật toán A* (A-Star)

**Đầu vào:** 
- Đồ thị $G = (V, E)$ (với $V$ là tập các đỉnh tọa độ, $E$ là tập các cạnh đường đi)
- Đỉnh bắt đầu $S \in V$
- Đỉnh đích $D \in V$

**Đầu ra:** 
- Đường đi ngắn nhất từ $S$ đến $D$ dưới dạng danh sách các đỉnh, hoặc `null` nếu không tồn tại đường đi.

**Hàm hỗ trợ:**
- $h(n)$: Hàm Heuristic tính khoảng cách Haversine từ đỉnh $n$ đến đích $D$.
- $w(u, v)$: Khoảng cách vật lý (trọng số cạnh) từ đỉnh $u$ đến đỉnh $v$.

1: **Nếu** $S = D$ **thì**
2: $\quad$ **Trả về** $[S]$
3: $gScore \leftarrow$ mảng rỗng lưu chi phí thực tế từ $S$ đến đỉnh hiện tại (mặc định là $\infty$)
4: $fScore \leftarrow$ mảng rỗng lưu tổng chi phí ước lượng $f(n) = g(n) + h(n)$
5: $cameFrom \leftarrow$ từ điển rỗng dùng để truy vết đường đi
6: $gScore[S] \leftarrow 0$
7: $fScore[S] \leftarrow h(S)$
8: $openSet \leftarrow$ Hàng đợi ưu tiên (Priority Queue) chứa các đỉnh cần duyệt, ưu tiên đỉnh có $fScore$ nhỏ nhất
9: Thêm $S$ vào $openSet$
10: **Trong khi** $openSet$ không rỗng **thực hiện:**
11: $\quad$ $u \leftarrow$ Đỉnh lấy ra từ $openSet$ có $fScore[u]$ nhỏ nhất
12: $\quad$ **Nếu** $u = D$ **thì**
13: $\quad$ $\quad$ **Trả về** hàm `RECONSTRUCT_PATH`$(cameFrom, u)$ *(truy vết lại đường đi)*
14: $\quad$ **Với mỗi** đỉnh kề $v$ của $u$ trong đồ thị $G$ **thực hiện:**
15: $\quad$ $\quad$ $tentative\_g \leftarrow gScore[u] + w(u, v)$
16: $\quad$ $\quad$ **Nếu** $tentative\_g < gScore[v]$ **thì**
17: $\quad$ $\quad$ $\quad$ *(Đã tìm thấy đường đi tốt hơn tới $v$)*
18: $\quad$ $\quad$ $\quad$ $cameFrom[v] \leftarrow u$
19: $\quad$ $\quad$ $\quad$ $gScore[v] \leftarrow tentative\_g$
20: $\quad$ $\quad$ $\quad$ $fScore[v] \leftarrow tentative\_g + h(v)$
21: $\quad$ $\quad$ $\quad$ **Nếu** $v \notin openSet$ **thì**
22: $\quad$ $\quad$ $\quad$ $\quad$ Thêm $v$ vào $openSet$
23: **Trả về** `null` *(Không tìm thấy đường đi)*

---

**Thuật toán 2:** Hàm truy vết đường đi (`RECONSTRUCT_PATH`)

**Đầu vào:** Danh sách các đỉnh liền trước $cameFrom$, đỉnh hiện tại $u$ (đích đến)
**Đầu ra:** Đường đi hoàn chỉnh từ xuất phát đến đích

1: $path \leftarrow$ Danh sách rỗng
2: **Trong khi** $u$ tồn tại (khác `null`) **thực hiện:**
3: $\quad$ Thêm $u$ vào đầu danh sách $path$ (prepend)
4: $\quad$ $u \leftarrow cameFrom[u]$
5: **Trả về** $path$

---

### 2. Code LaTeX (Sử dụng algorithm và algpseudocode)

```latex
\usepackage{algorithm}
\usepackage{algpseudocode}

\begin{algorithm}[H]
\caption{Thuật toán A* tìm đường đi ngắn nhất}
\begin{algorithmic}[1]
\Require Đồ thị $G$, đỉnh xuất phát $S$, đỉnh đích $D$
\Ensure Đường đi ngắn nhất từ $S$ đến $D$

\If{$S = D$}
    \State \Return $[S]$
\EndIf
\State Khởi tạo mảng $gScore$ với mọi phần tử là $\infty$
\State Khởi tạo từ điển truy vết $cameFrom$ rỗng
\State $gScore[S] \leftarrow 0$
\State $fScore[S] \leftarrow h(S)$ 
\State $openSet \leftarrow$ Hàng đợi ưu tiên chứa $\{S\}$
\While{$openSet$ không rỗng}
    \State $u \leftarrow$ Đỉnh có $fScore$ nhỏ nhất lấy ra từ $openSet$
    \If{$u = D$}
        \State \Return RECONSTRUCT\_PATH$(cameFrom, u)$
    \EndIf
    \For{mỗi đỉnh kề $v$ của $u$}
        \State $tentative\_g \leftarrow gScore[u] + \text{khoảng cách}(u, v)$
        \If{$tentative\_g < gScore[v]$}
            \State $cameFrom[v] \leftarrow u$
            \State $gScore[v] \leftarrow tentative\_g$
            \State $fScore[v] \leftarrow tentative\_g + h(v)$
            \If{$v \notin openSet$}
                \State Thêm $v$ vào $openSet$
            \EndIf
        \EndIf
    \EndFor
\EndWhile
\State \Return null
\end{algorithmic}
\end{algorithm}
```

---

## English Version (For Scientific Report)

### 1. Mathematical Pseudocode

**Algorithm 1:** Shortest Path Finding using A* Algorithm

**Input:** 
- Graph $G = (V, E)$ (where $V$ is the set of vertices/coordinates, $E$ is the set of edges)
- Start vertex $S \in V$
- Destination vertex $D \in V$

**Output:** 
- The shortest path from $S$ to $D$ as a list of vertices, or `null` if no path exists.

**Supporting Functions:**
- $h(n)$: Heuristic function calculating the Haversine distance from vertex $n$ to the destination $D$.
- $w(u, v)$: Physical distance (edge weight) from vertex $u$ to vertex $v$.

1: **If** $S = D$ **then**
2: $\quad$ **Return** $[S]$
3: $gScore \leftarrow$ empty map storing the actual cost from $S$ to the current vertex (default is $\infty$)
4: $fScore \leftarrow$ empty map storing the estimated total cost $f(n) = g(n) + h(n)$
5: $cameFrom \leftarrow$ empty dictionary used to trace back the path
6: $gScore[S] \leftarrow 0$
7: $fScore[S] \leftarrow h(S)$
8: $openSet \leftarrow$ Priority Queue containing vertices to be evaluated, prioritized by the lowest $fScore$
9: Add $S$ to $openSet$
10: **While** $openSet$ is not empty **do**
11: $\quad$ $u \leftarrow$ Vertex extracted from $openSet$ with the lowest $fScore[u]$
12: $\quad$ **If** $u = D$ **then**
13: $\quad$ $\quad$ **Return** `RECONSTRUCT_PATH`$(cameFrom, u)$
14: $\quad$ **For each** adjacent vertex $v$ of $u$ in graph $G$ **do**
15: $\quad$ $\quad$ $tentative\_g \leftarrow gScore[u] + w(u, v)$
16: $\quad$ $\quad$ **If** $tentative\_g < gScore[v]$ **then**
17: $\quad$ $\quad$ $\quad$ *(A better path to $v$ has been found)*
18: $\quad$ $\quad$ $\quad$ $cameFrom[v] \leftarrow u$
19: $\quad$ $\quad$ $\quad$ $gScore[v] \leftarrow tentative\_g$
20: $\quad$ $\quad$ $\quad$ $fScore[v] \leftarrow tentative\_g + h(v)$
21: $\quad$ $\quad$ $\quad$ **If** $v \notin openSet$ **then**
22: $\quad$ $\quad$ $\quad$ $\quad$ Add $v$ to $openSet$
23: **Return** `null` *(No path found)*

---

**Algorithm 2:** Path Reconstruction (`RECONSTRUCT_PATH`)

**Input:** Dictionary of parent pointers $cameFrom$, current vertex $u$ (destination)
**Output:** The complete path from start to destination

1: $path \leftarrow$ Empty list
2: **While** $u$ is not `null` **do**
3: $\quad$ Prepend $u$ to $path$
4: $\quad$ $u \leftarrow cameFrom[u]$
5: **Return** $path$

---

### 2. LaTeX Code (Using algorithm and algpseudocode)

```latex
\usepackage{algorithm}
\usepackage{algpseudocode}

\begin{algorithm}[H]
\caption{A* Shortest Path Algorithm}
\begin{algorithmic}[1]
\Require Graph $G$, start vertex $S$, destination vertex $D$
\Ensure Shortest path from $S$ to $D$

\If{$S = D$}
    \State \Return $[S]$
\EndIf
\State Initialize $gScore$ map with $\infty$ for all vertices
\State Initialize empty trace dictionary $cameFrom$
\State $gScore[S] \leftarrow 0$
\State $fScore[S] \leftarrow h(S)$ 
\State $openSet \leftarrow$ Priority Queue containing $\{S\}$
\While{$openSet$ is not empty}
    \State $u \leftarrow$ Vertex with the lowest $fScore$ extracted from $openSet$
    \If{$u = D$}
        \State \Return RECONSTRUCT\_PATH$(cameFrom, u)$
    \EndIf
    \For{each adjacent vertex $v$ of $u$}
        \State $tentative\_g \leftarrow gScore[u] + \text{distance}(u, v)$
        \If{$tentative\_g < gScore[v]$}
            \State $cameFrom[v] \leftarrow u$
            \State $gScore[v] \leftarrow tentative\_g$
            \State $fScore[v] \leftarrow tentative\_g + h(v)$
            \If{$v \notin openSet$}
                \State Add $v$ to $openSet$
            \EndIf
        \EndIf
    \EndFor
\EndWhile
\State \Return null
\end{algorithmic}
\end{algorithm}
```
