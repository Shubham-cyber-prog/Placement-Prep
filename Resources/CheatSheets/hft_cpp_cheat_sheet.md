# 🚀 High Frequency Trading (HFT) C++ Cheat Sheet

A quick reference guide for C++ concepts frequently asked in HFT and Low-Latency Systems interviews (Graviton, Tower Research, Optiver, etc.).

---

## ⚡ 1. Critical Performance Concepts

| Concept | Description | HFT Context |
| :--- | :--- | :--- |
| **Branch Prediction** | CPU guesses the outcome of `if/else` to pre-load instructions. | Avoid complex branching in hot paths. Use `likely()` / `unlikely()` hints. |
| **Cache Locality** | Keeping data close in memory (Spatial Locality) to minimize cache misses. | Use `std::vector` (contiguous) over `std::list` (scattered). |
| **False Sharing** | Multiple threads modifying variables on the same cache line. | Use `alignas(64)` to pad variables to separate cache lines. |

---

## 🧠 2. Memory Management

### Stack vs Heap
* **Stack:** Fast allocation (move stack pointer), deterministic. **Preferred in HFT.**
* **Heap (`new`/`malloc`):** Slow (syscalls, fragmentation), non-deterministic. **Avoid on hot path.**

### Smart Pointers
* **`std::unique_ptr`**: Zero overhead. Exclusive ownership.
* **`std::shared_ptr`**: Slight overhead due to atomic reference counting.

---

## 🛠️ 3. Modern C++ (C++17 / C++20) Features

* **`constexpr`**: Compute values at compile-time to reduce runtime work.
* **`std::string_view`**: Non-owning reference to a string. Avoids copying strings (essential for parsing market data).
* **`std::optional` / `std::variant`**: Type-safe alternatives to pointers and unions.

---

## 🌐 4. Networking Basics

* **UDP**: "Fire and Forget." Used for Market Data feeds (Multicast). Low latency, no ordering guarantee.
* **TCP**: "Reliable." Used for Order Entry (sending trades). High latency due to handshakes and ACKs.
* **Kernel Bypass**: Techniques (like DPDK, OpenOnload) to skip the OS network stack and read directly from the NIC.

---

## ⏱️ 5. "Every Nanosecond Counts" (Latency Numbers)

*Approximate timings every Systems Engineer should know:*

| Operation | Time |
| :--- | :--- |
| **L1 Cache Reference** | ~0.5 ns |
| **Branch Misprediction** | ~5 ns |
| **L2 Cache Reference** | ~7 ns |
| **Mutex Lock/Unlock** | ~25 ns |
| **Main Memory Reference (RAM)** | ~100 ns |
| **Context Switch (OS)** | ~10,000 ns (10 µs) |
| **1KB Network Packet send** | ~20,000 ns (20 µs) |

> **Takeaway:** Accessing RAM is ~200x slower than L1 Cache. This is why **Cache Locality** (using vectors) is the #1 optimization in HFT.

---

## ❓ Common Interview Questions

1. **Why is a virtual function call slower?**
   * It requires a V-Table lookup (extra pointer dereference) and prevents compiler inlining.

2. **How do you implement a lock-free queue?**
   * Using `std::atomic` and a Ring Buffer (Circular Buffer) structure.

3. **What is the difference between `latency` and `throughput`?**
   * **Latency:** Time taken for one packet to travel (Speed).
   * **Throughput:** How many packets can be processed per second (Volume).