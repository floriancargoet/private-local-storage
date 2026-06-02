import { beforeEach, expect, test } from "vitest";
import { createPrivateLocalStorage } from "./private-local-storage";
import { describe } from "node:test";

let privateLocalStorage: Storage;
beforeEach(() => {
  localStorage.clear();
  privateLocalStorage = createPrivateLocalStorage("test-", localStorage);
});

describe("methods", () => {
  test("setItem sets with a prefix", () => {
    privateLocalStorage.setItem("foo", "bar");
    expect(localStorage.getItem("test-foo")).toBe("bar");
  });

  test("getItem gets with a prefix", () => {
    localStorage.setItem("test-foo", "bar");
    expect(privateLocalStorage.getItem("foo")).toBe("bar");
  });

  test("getItem returns null for missing props", () => {
    expect(privateLocalStorage.getItem("foo")).toBeNull();
  });

  test("removeItem removes with a prefix", () => {
    localStorage.setItem("test-foo", "bar");
    privateLocalStorage.removeItem("foo");
    expect(localStorage.getItem("test-foo")).toBeNull();
  });

  test("clear only remove private keys", () => {
    privateLocalStorage.setItem("foo", "bar");
    localStorage.setItem("foo", "baz");
    privateLocalStorage.clear();
    expect(privateLocalStorage.getItem("foo")).toBeNull();
    expect(localStorage.getItem("foo")).toBe("baz");
  });

  test("key() only counts private keys", () => {
    localStorage.setItem("first", "1");
    privateLocalStorage.setItem("second", "2");
    localStorage.setItem("third", "3");
    expect(privateLocalStorage.key(0)).toEqual("second");
    expect(privateLocalStorage.key(1)).toBeNull();
    expect(localStorage.key(0)).toEqual("first");
    expect(localStorage.key(1)).toEqual("test-second");
    expect(localStorage.key(2)).toEqual("third");
  });
});

describe("properties", () => {
  test("length counts those with a prefix", () => {
    privateLocalStorage.setItem("foo", "bar");
    localStorage.setItem("foo", "baz");
    expect(privateLocalStorage.length).toBe(1);
    expect(localStorage.length).toBe(2);
  });
});

describe("direct access", () => {
  test("set", () => {
    privateLocalStorage.foo = "bar";
    expect(privateLocalStorage.getItem("foo")).toBe("bar");
  });
  test("get", () => {
    privateLocalStorage.setItem("foo", "bar");
    expect(privateLocalStorage.foo).toBe("bar");
  });
  test("get undefined", () => {
    expect(privateLocalStorage.foo).toBeUndefined();
  });
  test("delete", () => {
    privateLocalStorage.setItem("foo", "bar");
    delete privateLocalStorage.foo;
    expect(privateLocalStorage.getItem("foo")).toBeNull();
    // Delete unknown prop is accepted
    expect(() => delete privateLocalStorage.pouet).not.toThrow();
  });

  test("methods & properties are not writable", () => {
    // @ts-expect-error
    expect(() => (privateLocalStorage.setItem = "toto")).toThrow();
    // @ts-expect-error
    expect(() => (privateLocalStorage.length = 10)).toThrow();
  });
});

test("Object.keys() only return private keys", () => {
  privateLocalStorage.setItem("foo", "bar");
  localStorage.setItem("foo", "baz");
  expect(Object.keys(privateLocalStorage)).toEqual(["foo"]);
  expect(Object.keys(localStorage)).toEqual(["foo", "test-foo"]);
});

test("Non-string values are stringified", () => {
  // @ts-expect-error Types are too strict.
  privateLocalStorage.setItem("foo", { bar: 1 });
  expect(privateLocalStorage.getItem("foo")).toBe("[object Object]");
});

test("in operator", () => {
  privateLocalStorage.setItem("foo", "bar");
  expect("foo" in privateLocalStorage).toBe(true);
});
