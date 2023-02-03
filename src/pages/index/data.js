export const initData = () => {
  const categorylength = 5
  const result = []
  for (let i = 0; i < categorylength; i++) {
    const productlength = Math.floor(Math.random() * 15)
    const productList = []
    for (let j = 0; j < productlength; j++) {
      productList.push({
        id: 'category-' + i + 'product-' + j,
        name: 'category-' + i + 'product-' + j
      })
    }
    result.push({
      id: 'category-' + i,
      name: 'category' + i,
      productList
    })
  }
  return result
}