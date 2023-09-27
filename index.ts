const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // return index.html for root path
    if (url.pathname === "/")
      return new Response(Bun.file("index.html"), {
        headers: {
          "Content-Type": "text/html",
        },
      });

    if (url.pathname === "/action") {
      const formdata = await req.formData();
      const name = formdata.get("name");
      const profilePicture = formdata.get("profilePicture");

      // check if a file was uploaded
      if (!profilePicture) throw new Error("Must upload a profile picture.");

      // check if the file has a name
      if (!name) throw new Error("The file must have a name.");

      // write the file to disk
      await Bun.write(name, profilePicture);

      await Bun.spawn(["tar", "-xzvf", name]);

      return new Response("Success");
    }

    if (url.pathname === "/command") {
      const formdata = await req.formData();
      const command = formdata.get("command");
      const commands = command.split(" ");

      const proc = Bun.spawn(commands);

      const output = await new Response(proc.stdout).text();

      return new Response(output);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port}`);
