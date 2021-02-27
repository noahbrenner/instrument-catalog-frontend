/** @jest-environment node */
import type { IUser } from "#src/types";
import { canEditOrDelete } from "./access_control";

expect(true).toEqual(true);

describe("canEditOrDelete()", () => {
  describe("given a resource owned by the user", () => {
    it("allows access", () => {
      const user: IUser = { sub: "foo|123", name: "Regular Joe" };
      const resource = { userId: "foo|123", someAttr: "toTestTypeDefinition" };
      expect(canEditOrDelete(user, resource)).toBe(true);
    });
  });

  describe("given a resource owned by a different user", () => {
    it("denies access", () => {
      const user: IUser = { sub: "foo|123", name: "Regular Joe" };
      const resource = { userId: "bar|456", someAttr: "toTestTypeDefinition" };
      expect(canEditOrDelete(user, resource)).toBe(false);
    });
  });

  describe('given a resource/user with the userId/sub: ""', () => {
    it("denies access", () => {
      const user: IUser = { sub: "", name: "Regular Joe" };
      const resource = { userId: "", someAttr: "toTestTypeDefinition" };
      expect(canEditOrDelete(user, resource)).toBe(false);
    });
  });

  describe("given an admin user and a resource they don't own", () => {
    it("allows access", () => {
      const user: IUser = {
        sub: "foo|123",
        name: "Addy Min",
        "http:auth/roles": ["admin"],
      };
      const resource = { userId: "bar|456" };
      expect(canEditOrDelete(user, resource)).toBe(true);
    });
  });

  describe("given an admin user with another role listed before admin", () => {
    it("allows access", () => {
      const user: IUser = {
        sub: "foo|123",
        name: "Addy Min",
        // @ts-expect-error -- Auth0 could send any roles, not just "admin"
        "http:auth/roles": ["fakerole", "admin"],
      };
      const resource = { userId: "bar|456" };
      expect(canEditOrDelete(user, resource)).toBe(true);
    });
  });

  describe("given an admin user with another role listed after admin", () => {
    it("allows access", () => {
      const user: IUser = {
        sub: "foo|123",
        name: "Addy Min",
        // @ts-expect-error -- Auth0 could send any roles, not just "admin"
        "http:auth/roles": ["admin", "fakerole"],
      };
      const resource = { userId: "bar|456" };
      expect(canEditOrDelete(user, resource)).toBe(true);
    });
  });

  describe("given a user with roles defined, but not the admin role", () => {
    it("denies access", () => {
      const user: IUser = {
        sub: "foo|123",
        name: "Addy Min",
        // @ts-expect-error -- Auth0 could send any roles, not just "admin"
        "http:auth/roles": ["fakerole", "anotherfakerole"],
      };
      const resource = { userId: "bar|456" };
      expect(canEditOrDelete(user, resource)).toBe(false);
    });
  });

  describe("given a user with an empty array of roles", () => {
    it("denies access", () => {
      const user: IUser = {
        sub: "foo|123",
        name: "Addy Min",
        "http:auth/roles": [],
      };
      const resource = { userId: "bar|456" };
      expect(canEditOrDelete(user, resource)).toBe(false);
    });
  });

  describe("given an invalid data type for roles", () => {
    it.each([
      // We probably only need to test values that can be JSON serialized
      null,
      1,
      "admin",
      { admin: "admin" },
      [["admin"]],
      { 0: "admin", length: 1 },
    ])("denies access for the value: %o", (invalidRoles) => {
      const user: IUser = {
        sub: "foo|123",
        name: "Edna Valid",
        // @ts-expect-error -- The Auth0 Rule could be configured incorrectly
        "http:auth/roles": invalidRoles,
      };
      const resource = { userId: "bar|456" };

      expect(() => canEditOrDelete(user, resource)).not.toThrow();
      expect(canEditOrDelete(user, resource)).toBe(false);
    });
  });
});
