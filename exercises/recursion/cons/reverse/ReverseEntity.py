# BEGIN TEMPLATE
def concat(list1, list2):
# BEGIN SOLUTION
  A = None
  B = list1
  while B != None:
    A = new RecList(B.head, A)
    B = B.tail
  B = list2
  while A != None:
    B = new RecList(A.head, B)
    A = A.tail
  return B
# END SOLUTION
# END TEMPLATE
