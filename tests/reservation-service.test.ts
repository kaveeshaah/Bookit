import "dotenv/config";
import test, { describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/lib/db";
import {
  createReservation,
  cancelReservation,
  listReservations,
} from "../src/server/services/reservation-service";
import { ServiceError } from "../src/server/services/resource-service";

describe("Reservation Service", () => {
  let testUserId: number;
  let testResourceId: number;
  let inactiveResourceId: number;
  const createdReservationIds: number[] = [];

  before(async () => {
    // Setup test user
    const user = await db.user.create({
      data: {
        name: "Test Runner",
        email: `test-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "member",
      },
    });
    testUserId = user.id;

    // Setup active resource
    const resource = await db.resource.create({
      data: {
        name: `Test Room ${Date.now()}`,
        type: "room",
        capacity: 10,
        is_active: true,
      },
    });
    testResourceId = resource.id;

    // Setup inactive resource
    const inactiveResource = await db.resource.create({
      data: {
        name: `Inactive Room ${Date.now()}`,
        type: "room",
        capacity: 4,
        is_active: false,
      },
    });
    inactiveResourceId = inactiveResource.id;
  });

  after(async () => {
    // Cleanup created data
    if (createdReservationIds.length > 0) {
      await db.reservation.deleteMany({
        where: { id: { in: createdReservationIds } },
      });
    }
    if (testResourceId) {
      await db.resource.delete({ where: { id: testResourceId } }).catch(() => {});
    }
    if (inactiveResourceId) {
      await db.resource.delete({ where: { id: inactiveResourceId } }).catch(() => {});
    }
    if (testUserId) {
      await db.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
  });

  test("should successfully create a confirmed reservation", async () => {
    const startTime = new Date(Date.now() + 24 * 3600 * 1000); // tomorrow
    const endTime = new Date(startTime.getTime() + 2 * 3600 * 1000); // +2 hours

    const res = await createReservation({
      resource_id: testResourceId,
      user_id: testUserId,
      title: "Quarterly Strategy Review",
      start_time: startTime,
      end_time: endTime,
    });

    assert.ok(res.id, "Reservation should have an id");
    assert.equal(res.status, "confirmed");
    assert.equal(res.title, "Quarterly Strategy Review");
    createdReservationIds.push(res.id);
  });

  test("should prevent overlapping reservation for the same resource (double-booking guard)", async () => {
    const startTime = new Date(Date.now() + 48 * 3600 * 1000); // 2 days later
    const endTime = new Date(startTime.getTime() + 2 * 3600 * 1000);

    const first = await createReservation({
      resource_id: testResourceId,
      user_id: testUserId,
      title: "First Booking",
      start_time: startTime,
      end_time: endTime,
    });
    createdReservationIds.push(first.id);

    // Overlapping: 1 hour inside the first booking
    const overlappingStart = new Date(startTime.getTime() + 30 * 60 * 1000);
    const overlappingEnd = new Date(overlappingStart.getTime() + 60 * 60 * 1000);

    await assert.rejects(
      async () => {
        await createReservation({
          resource_id: testResourceId,
          user_id: testUserId,
          title: "Overlapping Conflict Booking",
          start_time: overlappingStart,
          end_time: overlappingEnd,
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.match(err.message, /already booked for this resource/i);
        return true;
      }
    );
  });

  test("should disallow booking an inactive resource", async () => {
    const startTime = new Date(Date.now() + 72 * 3600 * 1000);
    const endTime = new Date(startTime.getTime() + 3600 * 1000);

    await assert.rejects(
      async () => {
        await createReservation({
          resource_id: inactiveResourceId,
          user_id: testUserId,
          title: "Booking Inactive",
          start_time: startTime,
          end_time: endTime,
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.match(err.message, /inactive and can't be booked/i);
        return true;
      }
    );
  });

  test("should allow cancelling an upcoming reservation", async () => {
    const startTime = new Date(Date.now() + 96 * 3600 * 1000);
    const endTime = new Date(startTime.getTime() + 3600 * 1000);

    const res = await createReservation({
      resource_id: testResourceId,
      user_id: testUserId,
      title: "Temporary Booking",
      start_time: startTime,
      end_time: endTime,
    });
    createdReservationIds.push(res.id);

    const cancelled = await cancelReservation(res.id);
    assert.equal(cancelled.status, "cancelled");
  });

  test("should disallow cancelling past reservations", async () => {
    const pastStart = new Date(Date.now() - 5 * 3600 * 1000);
    const pastEnd = new Date(Date.now() - 4 * 3600 * 1000);

    const pastBooking = await db.reservation.create({
      data: {
        resource_id: testResourceId,
        user_id: testUserId,
        title: "Past Meeting",
        start_time: pastStart,
        end_time: pastEnd,
        status: "confirmed",
      },
    });
    createdReservationIds.push(pastBooking.id);

    await assert.rejects(
      async () => {
        await cancelReservation(pastBooking.id);
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.match(err.message, /past reservations can't be cancelled/i);
        return true;
      }
    );
  });
});
