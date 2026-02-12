# CONTRIBUTING
this is the contribution file, this is where contribution rules will be layed out, and ideas of how it should be used explained, refer to the following sections below
## File Types
### Top Level
---
- `web-data/`: file containing data used for the website, located here to avoid GitHub rebuild cost for every edit made as demonstrated [>Here<](https://github.com/GlitchHunterCoder/Bloxd-DevRef/deployments)
  - `nav.js`: source code of web viewer
  - `tree.json`: json tree of displayable files, located here to cache structure to avoid GitHub API costs
---
### Per Folder
---
- `format.md`:
  
  this is the main format file, you will find these files around the repo
  these tell editors
  - how they should structure the files
  - what is considered an allowed file
  - what the index.md should look like for that file
  
  the format.md governs the files at the same depth as it, and all nested files within that directory

- `index.md`:

  this is the webpage which is displayed, use the format described for the best rendering experience
  the format.md should be followed for best viewing experience
  
- `README.md`:

  this can be added at a current directory to give general infomation to users and editors alike
  and any general info which needs to be explained to editors can be here as long as it doesnt belong in a particular file there
---

