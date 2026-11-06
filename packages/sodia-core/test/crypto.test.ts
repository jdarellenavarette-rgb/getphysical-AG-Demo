import { describe, expect, it } from "vitest";
import { bytesToHex, hexToBytes, hmacSha256, sha256, timingSafeEqual, utf8ToBytes } from "../src/crypto";

describe("sha256 (FIPS 180-4 vectors)", () => {
  it("hashes the empty string", () => {
    expect(bytesToHex(sha256(new Uint8Array()))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });
  it("hashes 'abc'", () => {
    expect(bytesToHex(sha256(utf8ToBytes("abc")))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
  it("hashes a two-block message", () => {
    expect(bytesToHex(sha256(utf8ToBytes("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")))).toBe(
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"
    );
  });
  it("hashes one million 'a' characters", () => {
    expect(bytesToHex(sha256(new Uint8Array(1_000_000).fill(0x61)))).toBe(
      "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0"
    );
  });
});

describe("hmacSha256 (RFC 4231 vectors)", () => {
  it("test case 1", () => {
    expect(bytesToHex(hmacSha256(new Uint8Array(20).fill(0x0b), utf8ToBytes("Hi There")))).toBe(
      "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7"
    );
  });
  it("test case 2 (short key)", () => {
    expect(bytesToHex(hmacSha256(utf8ToBytes("Jefe"), utf8ToBytes("what do ya want for nothing?")))).toBe(
      "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"
    );
  });
  it("test case 6 (key longer than block size)", () => {
    expect(
      bytesToHex(
        hmacSha256(
          new Uint8Array(131).fill(0xaa),
          utf8ToBytes("Test Using Larger Than Block-Size Key - Hash Key First")
        )
      )
    ).toBe("60e431591ee0b67f0d8a26aacbf5b77f8e0bc6213728c5140546040f0ee37f54");
  });
});

describe("hex helpers", () => {
  it("parses Postgres bytea text output", () => {
    expect(Array.from(hexToBytes("\\x00ff10"))).toEqual([0, 255, 16]);
  });
  it("rejects malformed hex", () => {
    expect(() => hexToBytes("xyz")).toThrow();
    expect(() => hexToBytes("abc")).toThrow();
  });
  it("compares in constant time", () => {
    expect(timingSafeEqual(hexToBytes("abcd"), hexToBytes("abcd"))).toBe(true);
    expect(timingSafeEqual(hexToBytes("abcd"), hexToBytes("abce"))).toBe(false);
    expect(timingSafeEqual(hexToBytes("abcd"), hexToBytes("ab"))).toBe(false);
  });
});
