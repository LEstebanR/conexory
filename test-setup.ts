// Preloaded before every test file (see bunfig.toml [test] preload) so any
// module that reads these at import time — real or mocked — captures the
// same known values regardless of which test file imports it first.
process.env.WOMPI_EVENTS_SECRET = "test_events_secret"
process.env.WOMPI_PUBLIC_KEY = "pub_test_stub"
process.env.WOMPI_PRIVATE_KEY = "prv_test_stub"
process.env.WOMPI_INTEGRITY_SECRET = "test_integrity_secret"
