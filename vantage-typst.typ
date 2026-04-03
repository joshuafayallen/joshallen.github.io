#let primary_colour = rgb("#004D40")
#let link_colour = rgb("#004D40")

#let icon(name, shift: 1.5pt) = {
  box(
    baseline: shift,
    height: 10pt,
    image("icons/" + name + ".svg")
  )
  h(3pt)
}

#let projects(services) = {
  set text(8pt)
  let icon = icon.with(shift: 2.5pt)

  services.map(service => {
      icon(service.name)

      if "display" in service.keys() {
        link(service.link)[#{service.display}]
      } else {
        link(service.link)
      }
    }).join(h(10pt))
  [
    
  ]
}

#let findMe(services) = {
  set text(8pt)
  let icon = icon.with(shift: 2.5pt)

  services.map(service => {
      icon(service.name)

      if "display" in service.keys() {
        link(service.link)[#{service.display}]
      } else {
        link(service.link)
      }
    }).join(h(10pt))
  [
    
  ]
}

#let term(period, location) = {
  text(9pt)[#icon("calendar") #period #h(1fr) #icon("location") #location]
}


#let styled-link(dest, content) = emph(text(
    fill: link_colour,
    link(dest, content)
  ))

#let vantage(
  name: "",
  position: "",
  links: (),
  tagline: [],
  leftSide,
  rightSide
) = {
  set document(
    title: name + "'s CV",
    author: name,
  )
  // Jost works well
  // Cabin Works well
  // Assistant Works well 
  // Nobile does not work well
  // News Cycle doesnt work well
  set text(9.8pt, font: "Cabin")
  set page(
    margin: (x: 1.2cm, y: 1.2cm),
  )


  [= #name]
  text(12pt, weight: "medium",[#position])

  v(0pt)
  findMe(links)

  tagline

  grid(
    columns: (7fr, 4fr),
    column-gutter: 2em,
    leftSide,
    rightSide,
  )
}
