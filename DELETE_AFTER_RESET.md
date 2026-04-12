After admin login works, run:

  rm -rf app/api/admin/reset-pw
  rm DELETE_AFTER_RESET.md
  git add . && git commit -m "remove one-time reset endpoint" && git push
