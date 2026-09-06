# Bonus Question Solutions

**Note:** Q3 is not included in the assignment prompt. It goes directly from Q2 to Q4.

---

## Q1: Current Designation of Every Employee

For this question, I used `ROW_NUMBER()` to find the latest designation record for each employee.

I partitioned the records using `emp_id` and sorted them by `effective_date` in descending order. I also used `txn_id DESC` in case there are multiple records for the same employee on the same date. The first row for each employee is then their current designation.

```sql
WITH RankedDesignations AS (
    SELECT
        emp_id,
        emp_name,
        designation AS current_designation,
        ROW_NUMBER() OVER (
            PARTITION BY emp_id
            ORDER BY effective_date DESC, txn_id DESC
        ) AS rn
    FROM emp_designation_log
)

SELECT
    emp_id,
    emp_name,
    current_designation
FROM RankedDesignations
WHERE rn = 1
ORDER BY emp_id;
```

### PostgreSQL version

If PostgreSQL is being used, the same result can also be obtained using `DISTINCT ON`.

```sql
SELECT DISTINCT ON (emp_id)
    emp_id,
    emp_name,
    designation AS current_designation
FROM emp_designation_log
ORDER BY emp_id, effective_date DESC, txn_id DESC;
```

---

## Q2: Employee Designation Timeline

Here I used `LAG()` and `LEAD()` to get the designation before and after each record.

The records are ordered by employee and then by date. `txn_id` is also included so that records having the same date are kept in a fixed order.

```sql
SELECT
    emp_id,
    effective_date,
    LAG(designation) OVER (
        PARTITION BY emp_id
        ORDER BY effective_date ASC, txn_id ASC
    ) AS previous_designation,
    designation,
    LEAD(designation) OVER (
        PARTITION BY emp_id
        ORDER BY effective_date ASC, txn_id ASC
    ) AS next_designation
FROM emp_designation_log
ORDER BY emp_id, effective_date ASC, txn_id ASC;
```

For the first record of an employee, there is no previous designation, so `LAG()` returns `NULL`. Similarly, `LEAD()` returns `NULL` for the last record.

---

## Q4: Employee Designation at Time of Project Allocation

For this question, I need to find which designation was valid when each project allocation started.

One way is to create a range for each designation. The current record starts at `effective_date`, and the next designation's `effective_date` is used as the end of that range.

I used a `LEFT JOIN` so that an allocation is still shown even if there is no designation recorded before the allocation date.

```sql
WITH DesignationRanges AS (
    SELECT
        emp_id,
        emp_name,
        designation,
        effective_date AS valid_from,
        LEAD(effective_date) OVER (
            PARTITION BY emp_id
            ORDER BY effective_date ASC, txn_id ASC
        ) AS valid_to
    FROM emp_designation_log
),

EmpNames AS (
    SELECT DISTINCT
        emp_id,
        emp_name
    FROM emp_designation_log
)

SELECT
    a.allocation_id,
    a.emp_id,
    COALESCE(dr.emp_name, en.emp_name) AS emp_name,
    a.project_name,
    a.allocated_role,
    a.allocation_start,
    dr.designation AS designation_at_allocation
FROM emp_allocation_log a
LEFT JOIN EmpNames en
    ON a.emp_id = en.emp_id
LEFT JOIN DesignationRanges dr
    ON a.emp_id = dr.emp_id
    AND a.allocation_start >= dr.valid_from
    AND (
        a.allocation_start < dr.valid_to
        OR dr.valid_to IS NULL
    )
ORDER BY a.allocation_id;
```

### Another way to solve Q4

Instead of creating date ranges, I can first join each allocation with all designation records that were effective on or before the allocation date. Then I rank those records and keep the latest one.

```sql
WITH RankedAllocations AS (
    SELECT
        a.allocation_id,
        a.emp_id,
        d.emp_name,
        a.project_name,
        a.allocated_role,
        a.allocation_start,
        d.designation AS designation_at_allocation,
        ROW_NUMBER() OVER (
            PARTITION BY a.allocation_id
            ORDER BY d.effective_date DESC, d.txn_id DESC
        ) AS rn
    FROM emp_allocation_log a
    LEFT JOIN emp_designation_log d
        ON a.emp_id = d.emp_id
        AND d.effective_date <= a.allocation_start
)

SELECT
    allocation_id,
    emp_id,
    emp_name,
    project_name,
    allocated_role,
    allocation_start,
    designation_at_allocation
FROM RankedAllocations
WHERE rn = 1 OR rn IS NULL
ORDER BY allocation_id;
```

The second approach is simpler to understand because for each allocation it just finds the most recent designation that existed at that time.
