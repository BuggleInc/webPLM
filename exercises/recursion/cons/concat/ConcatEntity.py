# BEGIN TEMPLATE
def concat(l1, l2):
  # BEGIN SOLUTION
  # Revert l1 into A
  A = None
  B = l1
  while B != None:
    A = RecList(B.head, A)
    B = B.tail
  # add A at front of l2 in B
  B = l2
  while A != None:
    B = RecList(A.head, B)
    A = A.tail
  return B
  # END SOLUTION
# END TEMPLATE
