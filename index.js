#!/usr/bin/env node

const debounce = require("lodash.debounce")
const chokidar = require("chokidar")
const program = require("caporal")
const { access } = require("fs-extra")
const { spawn } = require("child_process")
const colors = require("colors")

program
    .version("0.0.1")
    .argument("[filename]", "Name of a file to execute")
    .action(async ({ filename }) => {
        const file = filename || "index.js"

        try {
            await access(file)
            console.log(file)
        } catch (err) {
            throw new Error(`File '${file}' not existed at '${process.cwd()}'`)
        }

        let proc;
        const start = debounce((event, path) => {
            if (proc) {
                proc.kill()
                console.log(colors.bold.blue(`>>>>> Restarting ${file}`))
            } else {
                console.log(colors.bold.blue(`>>>>> Starting ${file}`))
            }
            proc = spawn("node", [file], { stdio: "inherit" })
        }, 100)

        chokidar.watch(".")
            .on("add", start)
            .on("change", start)
            .on("unlink", start)
    })

program.parse(process.argv)
