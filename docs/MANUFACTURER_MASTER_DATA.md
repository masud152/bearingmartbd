# Manufacturer master-data specification

Each row represents one exact manufacturer designation. Do not normalize, replace,
or infer suffixes such as `2Z`, `ZZ`, `C3`, `2RS`, `LLU`, `NSE`, or `ZE`.

## Required import fields

`brand`, `category`, `bearing_type`, `basic_model`, `manufacturer_designation`,
`bore_mm`, `od_mm`, `width_mm`, `availability`, `source_url`, `source_title`,
`source_document`, `source_document_version`, `source_verified_at`, and
`data_verification_status`, and `published` are required. For every master-data
batch, `published` must be `no`; publishing is deliberately separate from import.

`brand` must be one of SKF, NTN, NSK, KOYO/JTEKT, TIMKEN, or NACHI. The normal
batch importer accepts only `https` source URLs on the appropriate official
manufacturer domain. `source_document` identifies the official page, catalogue,
or PDF and `source_document_version` preserves the publisher version, catalogue
number, or `web-page` when no explicit version is supplied.

## Optional technical fields

`series`, `sku`, `seal_shield`, `clearance`, `cage`, both load ratings and their
canonical `N` units, `speed_rpm`, `speed_note`, and `image_path` are optional.
Omit a field when the official source does not support it. Do not estimate it.

## Verification states

- `verified`: official source reviewed; eligible for draft import.
- `incomplete`: source exists but required technical information is missing; report only.
- `manual_review`: a reviewer must resolve a source, designation, or technical conflict; report only.
- `rejected`: unsuitable or conflicting data; report only.

The importer never changes an imported record to published. `published=yes` is
rejected, including in a verified row. Publishing remains a separate Admin action.

## CSV handling and reports

The template is conventional UTF-8 CSV. Fields containing commas or quotes must
use CSV quoting. Every run can be made with `--dry-run` and `--report <file>` to
produce accepted, incomplete, manual-review, rejected, duplicate, image, and
insert/update-preview lists before the database is changed.

## Duplicate and update policy

The stable business identity is `(brand, normalized manufacturer designation)`.
Duplicates inside one CSV are rejected. An existing database identity is reported
as `wouldUpdate` in a dry run and updated only by a non-dry run. Static legacy
catalogue records retain their existing routes and are not deleted or rewritten.

## Images

`image_path` is optional. Existing product images are never overwritten by a
batch import. A supplied image filename must identify the selected brand; otherwise
the row is reported as an image problem and is not imported.
