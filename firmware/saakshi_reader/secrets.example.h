/* Copy this file to secrets.h and fill it in.
 * secrets.h is git-ignored. Never commit real credentials.
 * Never print any of these over serial. */

#pragma once

#define WIFI_SSID      ""
#define WIFI_PASSWORD  ""

/* Base URL of the Saakshi backend, no trailing slash.
 * Example: "http://192.168.1.42:8000" on a demo LAN. */
#define BACKEND_URL    ""

/* Shared secret the device sends as a bearer token.
 * This is a demo prop, not an identity system — the backend must only ever
 * expose read-only endpoints to this token. */
#define DEVICE_TOKEN   ""
