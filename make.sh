#!/bin/sh
java -jar compiler.jar --js sand.js --js sandUI.js --js util.js --js_output_file sand_mini.js --compilation_level ADVANCED_OPTIMIZATIONS
