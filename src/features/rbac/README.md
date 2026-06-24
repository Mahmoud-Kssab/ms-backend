# RBAC Feature

Users do not receive permissions directly. A user receives one or more roles through
`user_roles`, and roles receive permissions through `role_permissions`.

Permission keys use the `resource:action` convention, for example:

- `chat:read`
- `chat:write`
- `chat:delete`
- `settings:manage`

Use the `Permissions` decorator on protected handlers:

```ts
@Permissions(PermissionKey.ChatDelete)
```

`PermissionsGuard` loads the authenticated `user.id`, then asks `RbacService`
whether the user has every required permission. The service always fetches
permissions through roles and returns unique permission keys only.
