---
title: Encryption Algorithms
description: A dive into how encryption works and why it is important.
---

*A dive into how encryption works and why it is important*

---

## Section 1: Introduction — Core Applications and Fundamental Types

### Core Applications

**Communications**
- E2EE is becoming standard for direct messaging
- Examples: TLS/SSL (HTTPS), SSH, Instant Messaging
- Used to store secret data or to message authorized parties
- Core part of IPsec (routing, DNS, tunneling)
- PGP suite: allows encryption & signing

**Credentials**
- Used for confirming someone is who they say they are
- Account passwords: local, cloud, etc.
- 802.11 suite: WPA2, WPA3
- Authentication: EAP, MSCHAPv2
- Disk encryption / file encryption

---

### Encryption Types

**Symmetric**
- Key is pre-shared between client and recipient
- Used to both encrypt and decrypt message
- Extremely fast; hardware-accelerated

**Asymmetric (Public-Key)**
- Two keys: Public and Private
- Often used to exchange credentials / verify authenticity
- **Encryption:** Encrypt with recipient's public key — only their private key can decrypt
- **Authentication:** Sign with your private key; anyone with your public key can verify

---

### Key Types

| Algorithm | Type | Basis |
|-----------|------|-------|
| **RSA** (Rivest-Shamir-Adleman) | Asymmetric | Factorization of large numbers and modular arithmetic |
| **AES** (Advanced Encryption Standard) | Symmetric block cipher | Confusion and diffusion |
| **ECC** (Elliptic Curve Cryptography) | Asymmetric | Elliptic Curve Discrete Logarithm Problem (ECDLP) |

---

## Section 2: RSA Encryption

### RSA Key Generation

RSA relies on the **trapdoor function**: easy to produce, difficult to reverse.

- `N = p × q` where p and q are large primes

**Euler's Totient Function φ(n)** counts the number of positive integers up to n that are relatively prime to n (sharing no common factors other than 1).

> **Example — n = 9:**
> Integers with common factors: {3, 6, 9}
> Totatives: {1, 2, 4, 5, 7, 8} → φ(9) = 6
>
> **Example — n = 15** (since 15 = 3 × 5, both prime):
> φ(15) = φ(3) × φ(5) = (3−1) × (5−1) = 2 × 4 = **8**
> Totatives: {1, 2, 4, 7, 8, 11, 13, 14}

---

### RSA Implementation

**Key Generation Steps:**
1. Compute `N = p × q`
2. Compute `φ(N) = (p−1)(q−1)`
3. **Public Exponent:** Choose `e` with `1 < e < φ(N)` and `gcd(e, φ(N)) = 1`
4. **Private Exponent `d`:** `e × d ≡ 1 (mod φ(N))`
5. **Public Key:** `(N, e)` — **Private Key:** `(N, d)`
6. **Encryption:** `C = Mᵉ (mod N)`
7. **Decryption:** `M = Cᵈ (mod N)`

**Worked Example (p = 3, q = 11):**
- `n = 33`, `φ(n) = 20`, `e = 3`, `d = 7`
- Public Key: `(33, 3)` — Private Key: `(33, 7)`
- Encrypt message `m = 7`: `c = 7³ (mod 33) = 343 (mod 33) = 13`
- Decrypt ciphertext `c = 13`: `m = 13⁷ (mod 33) = 7` ✓

---

### RSA Specs & Tradeoffs

**Technical Specifications:**
- Typical key sizes: 2048-bit (current standard), 4096-bit (high security)
- Prime numbers p, q: 300+ digits for a 2048-bit key
- Common public exponent: 65537 (2¹⁶ + 1)

| Advantages | Disadvantages |
|------------|---------------|
| Simple & versatile | Computationally expensive |
| Proven reliable — used since 1977 | Large key sizes |
| Hardware accelerated | Side-channel risks (predictable) |
| Asymmetric | Vulnerable to quantum attacks |

---

## Section 3: AES Encryption

### Block Cipher Algorithm

1. Takes a fixed-length block of plaintext and a secret key, transforming them into a ciphertext block of the same length
2. **Block size:** Common sizes are 64 or 128 bits; messages smaller than the block size are padded
3. **Rounds:** Performs a series of repetitive operations — substitution and diffusion

---

### Confusion and Diffusion

**Confusion**
- Each byte is substituted via a nonlinear lookup table (S-box)
- Makes the relationship between key and ciphertext complex and unpredictable
- Example: Caesar Cipher shifts each letter by a fixed amount

**Diffusion**
- Bytes are shuffled and mixed across the block
- **Avalanche Effect:** A single changed input bit affects roughly half of the output bits after a few rounds
- Example transposition: `abcd` → `dabc`

---

### AES

**How It Works:**
1. Symmetric algorithm
2. Key sizes: 128, 192, or 256 bits
3. Block size: fixed at 128 bits
4. Structure: Substitution-Permutation Network (SPN)
5. Rounds: 10 (128-bit), 12 (192-bit), 14 (256-bit)

Each round consists of: **SubBytes → ShiftRows → MixColumns → Add Round Key**
(Last round omits MixColumns)

---

### AES Uses & Tradeoffs

**Uses:**
- File/disk encryption
- Secure communications (TLS/SSL data stream)
- Wireless security: WPA2 and WPA3
- Government standards: Top Secret data protection globally

| Advantages | Disadvantages |
|------------|---------------|
| Speed | Key distribution challenges |
| Secure | Implementation complexity |
| Hardware accelerated | Low memory footprint (can be a constraint) |

---

## Section 4: ECC Encryption

### Math Refresh

**Linear (Continuous) Logarithms**
- The inverse of exponents: given `bˣ = y`, find x
- Power rule: `log(bˣ) = x · log(b)` → `x = log(y) / log(b)`
- Example: `2ˣ = 32` → `x = log(32)/log(2) = 5`

**Modular (Discrete) Logarithms**
- Given `gˣ ≡ y (mod n)`, find x
- The power rule no longer applies — this is the **Discrete Logarithm Problem (DLP)**
- For small numbers, relatively solvable; for large numbers, computationally infeasible

---

### Discrete Logarithms

Computing successive powers of `g = 2 (mod 5)`:

| Power | Result (mod 5) |
|-------|----------------|
| 2¹ | 2 |
| 2² | 4 |
| 2³ | 3 |
| 2⁴ | 1 |
| 2⁵ | 2 (cycle repeats) |

- Outputs follow no predictable order
- For a 256-bit modulus, the cycle length is astronomically large
- Security relies on the computational inefficiency of reversing this process

---

### Elliptic Curves

**Definition:** `y² = x³ + ax + b (mod p)`

- Parameters `a`, `b`, and `p` define the specific curve
- Only discrete integer coordinate pairs `(x, y)` are valid points for cryptography
- **Point Addition:** Given two points A and B, draw a line through them to find a third intersection point R, then reflect R across the x-axis to get `A + B`

---

### ECC Encryption

**Scalar Multiplication:** Repeated addition of a point to itself
- `P = k × G` (G is the generator point, k is the scalar)
- **Private key:** `k` — a randomly chosen large integer, kept secret
- **Public key:** `P` — the resulting point, shared openly

**ECDLP (Elliptic Curve Discrete Logarithm Problem):**
- Computing `P` from `k` and `G` is fast
- The reverse has no known sub-exponential algorithm for elliptic curves — this is the security foundation

---

## Section 5: Conclusion

### Relevance for Security

- **Privacy:** End-to-end encryption (E2EE) means only you and your recipient can read your messages — not your ISP, app company, or anyone else
- **Network protection:** Secures communications on networks you can't control (public WiFi, employer/school networks)
- **Trust backbone:** Secures sensitive transactions and underpins trust in digital communications
- **Encrypted authentication:** Keeps your identity yours
- **Breach protection:** Protects your data even when companies are compromised

**Case Study — Logjam (2015):**
- Attack on live TLS connections exploiting outdated policy and mathematical precomputation
- Demonstrated that theoretical weaknesses can become real, scalable attacks
- TLS still supported weak encryption standards (512-bit keys)
- Using the **Number Field Sieve (NFS)**, a 512-bit key could be broken in about a week
- Most servers shared the same set of primes — a one-time computation could break thousands of machines simultaneously

---

### Mesh Networking Relevance

**Key Distribution Challenges:**
- Mesh networks have nodes joining and leaving dynamically, making secure distribution and routing difficult
- Most mesh networks use **asymmetric** approaches for handshakes, then **symmetric (AES)** for bulk data
- **Multi-hop exposure:** each hop is a potential interception point — E2EE is necessary
- **Node authentication:** RSA or ECC signatures prove identity without sharing a secret

---

### Future Considerations: Quantum Computing

- **Shor's algorithm:** A quantum algorithm capable of finding prime factors of an integer — both RSA and ECC are vulnerable
- As quantum computing develops, quantum-resistant standards are becoming necessary
- **Post-quantum cryptography (PQC):** NIST finalized standards in 2024, based on the difficulty of **lattice problems**
- Migration to PQC is complex — affects hardware, mesh networks, and all existing infrastructure

**If "Q-Day" happened tomorrow:**
- **What breaks:** RSA and ECC — keys derivable, digital signatures forgeable
- **What survives:** Symmetric encryption (AES) and hashing algorithms (SHA-2) with longer keys
- **Real risk:** Loss of trust in public-key infrastructure, certificate authorities, and digital identities
- **Recovery:** Depends on speed of migration to post-quantum standards (FIPS 203, 204, 205)