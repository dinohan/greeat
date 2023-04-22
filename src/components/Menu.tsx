export default function Menu({
  id,
  name,
  group,
  calorie,
  image,
}: {
  id: string
  name: string
  group: string
  calorie: number
  image?: string
}) {
  return (
    <li key={id} className="list_item_wrapper menu_wrapper">
      <h2 className="menu_name">{name}</h2>
      <div className="menu_image_wrapper">
        { image
          ? <img src={image} alt={name} />
          : <div className="no_image" />
        }
      </div>
      <div className="menu_description">
        <div>{group}</div>
        <div>{calorie} kcal</div>
      </div>
    </li>
  )
}