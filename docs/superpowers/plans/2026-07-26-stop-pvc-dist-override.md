# Stop PVC Dist Override Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the server always runs the code contained in the pulled container image instead of stale compiled files persisted on the data PVC.

**Architecture:** Keep `/app/data` mounted for the SQLite database and uploads, but remove the startup-time copy from `/app/data/dist` into the image filesystem. Apply the same command change to the live StatefulSet and verify the replacement Pod through Kubernetes state, startup route logs, and public API probes.

**Tech Stack:** Kubernetes StatefulSet, Sealos Cloud, NestJS, GHCR.

## Global Constraints

- Do not delete or recreate the PVC.
- Do not modify the SQLite database.
- Preserve `pnpm prisma db push && node dist/main`.
- Only the server StatefulSet needs a rollout; admin and miniapp already run their published digests.

---

### Task 1: Remove the stale-code startup override

**Files:**
- Modify: `.sealos/server-patch.yaml`

**Interfaces:**
- Consumes: the image working directory `/app/packages/server`.
- Produces: a container command that runs the image-bundled `dist/main`.

- [ ] **Step 1: Verify the regression is present**

Run:

```bash
rg -n '/app/data/dist|cp -r .*dist' .sealos/server-patch.yaml
```

Expected: matches the PVC-to-image copy command.

- [ ] **Step 2: Implement the minimal configuration change**

Set the command body to:

```yaml
cd /app/packages/server &&
pnpm prisma db push &&
node dist/main
```

- [ ] **Step 3: Verify the regression is absent**

Run:

```bash
! rg -n '/app/data/dist|cp -r .*dist' .sealos/server-patch.yaml
```

Expected: exit 0 with no matches.

- [ ] **Step 4: Validate YAML**

Run:

```bash
python3 -c 'import yaml; yaml.safe_load(open(".sealos/server-patch.yaml"))'
```

Expected: exit 0.

### Task 2: Patch and verify the live StatefulSet

**Files:**
- Modify live Kubernetes resource: `statefulset/lv-cube-server`

**Interfaces:**
- Consumes: Sealos kubeconfig for namespace `ns-0qkedm1h`.
- Produces: a new Ready `lv-cube-server-0` Pod running the published image code.

- [ ] **Step 1: Patch the Pod template command and add a rollout annotation**

Use the Kubernetes API to replace the container command and set a current `kubectl.kubernetes.io/restartedAt` annotation.

- [ ] **Step 2: Wait for the StatefulSet rollout**

Poll until `readyReplicas=1`, `updatedReplicas=1`, and the new Pod creation timestamp is later than the patch.

- [ ] **Step 3: Verify runtime routes**

Read startup logs and confirm:

```text
UploadController {/api/upload}
Mapped {/api/upload/image, POST}
Mapped {/api/user/:id/status, PATCH}
Mapped {/api/user, POST}
```

- [ ] **Step 4: Run public API smoke tests**

Authenticate normally as admin, upload an image, create a temporary user, update its status, and delete it. Probe `PUT /api/product/:id`; a non-404 application response proves routing, while a full success requires a normal supplier login and a valid product.

