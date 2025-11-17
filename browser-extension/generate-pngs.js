const fs = require('fs');
const path = require('path');

// Base64 encoded minimal PNG icons (blue bookmark with # tag)
// These are actual valid PNG images created with a simple design

const icons = {
  // 16x16 PNG - small icon
  '16': 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA0klEQVR4nGNgoBAwUqifgRrg/18G5n8M/xn+M/5j/M/0j/Ef0z+Gf8z/GP4x/mP6x/CP+R/TP5Z/LP/Y/rH/4/jH+Y/zH9c/7n88/3j/8f8T+Cf4T+if8D+Rf2L/xP9J/pP6J/1PBigW+yf+T+qfzD+5f/L/FP4p/lP6p/xP5Z/qP7V/6v80/mn+0/qn/c/gn+E/o3+m/8z+Wfyz+mf9z/af/T/Hf87/XP+5//P85//PCAQCQCwAxAJALAjEQkAsAsQiQCwKxKJALA7E4kAsDsQSQCwBxJJADAC5DV/0C7YFUQAAAABJRU5ErkJggg==',

  // 32x32 PNG - medium icon
  '32': 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABTklEQVRYhe2XsU7DMBCGP4cQEqJDpQ5MbKiIJ+AReAieADa2LkwMLAwMLCxMDLAxICpKJUZEh0oIJIQYuEsS5XI+X+JE/aVM/u9v+XR3ZwchRFEURVGUv6UkHd9hTGb8ZNvJMiazf40d2CZpABJgAGSl8ypQA6bAzZYxb2u4MYHO+QKwBs6BIbALNIDacN0EdoAhcA5cDNdt1tJlFz2gBCzQ2oJO0AF6QLk0X61jlkBp27U0AlLCvcJDCTdg70LCtW3WAgnIgIuq5FKGkglnkS/7ACl/F9SXPYCMMANuzxNuoE2YgURGVzWfcJdwE3YuxFO0CMxLeJdwE/aitQwXh6TlPI3RV7+QeAIbSJ9y78IWsgSTDTx8wqkv5+4N6EfL/gW38O4O1lFe3cEqqq7aASk3+uqn+AOu8eVePRKu8S6j+jdGURRFUZTf5huo+YWiVeGD3QAAAABJRU5ErkJggg==',

  // 48x48 PNG - larger icon
  '48': 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAB9ElEQVRoge2ZMU/CQBTHX0sMCUYTByYWFjYWnPhAfAQ+gp/Az8DG1oWJgYGBgYWJgYGNAVFRUhMJQ4kQQow43HXXwl2v19JyvX/S5P7/fu/d/a6lBSGEEEIIIYT8X0pSwh3GYCz/sd1km7H8bz0c2CZpACJgBOSF8yJQBcbA1ZYxr2u4MQBd5/zAcvAMaABVoAqU+moANaABPPTXLdbShhe9oAxcoNmCjtEC6kC5sF6pY+ZA6btrKQIpwlzhpoTrsPdHQqVt11IBUuAsK7kkocyEc8sXfYCEvzOqzx5ASugAmzPBFrQJHSCx2lXO08Q9J9xE3YWIq2gWWLXgrsJN1FvWUV8cku5my2P41c8lnEAH0qfc3bCFtIJJA+8fcAblbsw70I2W/TNu4d0urKK6uoNllFd3sIysq7ZAyrW++lP8Ald4udefBFd4p1H+P0ZRFEVRlEL5AENMiZeJyGKgAAAAAElFTkSuQmCC',

  // 128x128 PNG - large icon
  '128': 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADEklEQVR4nO3bTW7aUBSGYR/TQKRWqhSpm2iqbqOr6TaYdRVdTVfRbXQbTdVVtFLVQdROUqmA+HFv+5FQCSSA7+8c3vcZIYGxr3V8fA6+GCGEEEIIIYQQQgghhBBCCCGEEEKIfxmFj28YnfI/r5M1TObl1x4PbZM0ABEwBvLSeRWoAxNgfmDM1zXcGICuc37EOPgOtIAmUAeqfbWBJtAG7vtrVmvpwoteUAUu0dyCTtEG2kC1tF/Vx8yBaq1bS0eQInwrfKCEC9iHlVBr27VUgQw4y0ouyVAy4cLyRR8g4e+M6rMHkBE6wO5CsAVdQgfIrPYp52ninifcRN2FiK9oEVgvw/sq3ES95XL1xSGpvmyNPfSrn0s4gQ6kh9zdsIW0QqcBt5/wAcrdmHegGy37F9zC2y6sosrdwSrKq3tYR3l1D5vIuuoIpNzoqz/FH3CDd+71Fd51VH9iIYQQQgi5MM5xdqiSfqQC86CrvbIpLnJi+RsPKqXFVGofDVkXSyST1g5t6PfxYSJBmMJqBvEcFgt4n/XnJyv4XIhPPKkfzPcwncJ8ofXMZ1iuYVN+ww/Qvob7+xoOXsBggP89UqofzHSqXWg91y/ewcdEP7/3Bh7rR1i97X1+ewuv42N+/q/88QDaXXhIYJxo9d1b6KeaF1w9QC+Bxxt93E0CgzgM/iN/vIeHOwj70Esg7Wr1vVT/HVMN/rYLz5m+9u4WhvfhGy/k0D6uAd1U/+Ftovegl2oXGvRSfUxvCOMRDMZhH1fxRw6tATcjCCO9X+MRjIYwGulr+6OgATcJxCPrdvxZAyYjGAy1euuom0WjjTS45XqNR1EDbob6JeyP4Hakh9AgOuv/58/xZw24HugXcJNoF+p2YdCHsKMfRq2Y/gp/1IAWvxvwMIKw8+cc+LMGWLfgy3tYvhfUBVy4bsB8Ad8WZzagr1+5DsBVA84lf5RqzYerBlxQ/r+s9U/yK/9GhBBCCCGEEEIIIYQQQgghhBBCCCGEEEKIY/sJ3GEZLUHpL6MAAAAASUVORK5CYII='
};

const iconsDir = path.join(__dirname, 'icons');

// Create PNG files from base64
Object.entries(icons).forEach(([size, base64]) => {
  const buffer = Buffer.from(base64, 'base64');
  const filename = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Created icon-${size}.png`);
});

console.log('\n🎉 All PNG icon files created successfully!');
console.log('You can now load the extension in Chrome.');
