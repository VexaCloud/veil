npx() {
  if [ "$1" = "serve" ]; then
    echo "Npx serve is not a vaild command. Running 'npm start' instead"
    npm start
  else
    command npx "$@"
  fi
}
